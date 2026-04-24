import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

import {
  buildBlogContentSignature,
  extractJsonObject,
  normalizeKeyPoints,
  normalizePromptSuggestions,
  sanitizeAssistantText,
  stripBlogContentForAi,
  type BlogAiChatResponse,
  type BlogAiMessage,
  type BlogAiSummary,
} from "@/lib/blog-ai";
import { getBlogById } from "@/lib/blogs";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RequestPayload = {
  mode?: "summary" | "chat";
  contentSignature?: string;
  messages?: BlogAiMessage[];
};

const SUMMARY_CACHE_REVALIDATE_SECONDS = 60 * 60 * 24 * 14;
const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.3-8b-instruct:free";

function getOpenRouterModels() {
  const configuredModels =
    process.env.OPENROUTER_MODELS?.trim() || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

  const models = configuredModels
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return [...new Set(models)];
}

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY.");
  }

  return new OpenRouter({
    apiKey,
    httpReferer: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
    appTitle: process.env.OPENROUTER_APP_NAME?.trim() || "Shreyas Portfolio",
  });
}

function getProviderErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const statusCode = (error as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === "number") {
    return statusCode;
  }

  const status = (error as { status?: unknown }).status;
  if (typeof status === "number") {
    return status;
  }

  return undefined;
}

function getProviderErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to generate AI response right now.";
}

function extractChatText(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item === "object" && item !== null && "text" in item && typeof item.text === "string") {
          return item.text;
        }

        return "";
      })
      .join(" ");
  }

  return "";
}

function isProviderUnavailableError(error: unknown) {
  const status = getProviderErrorStatus(error);
  const message = getProviderErrorMessage(error).toLowerCase();

  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /provider returned error|no endpoints found|temporarily unavailable|overloaded|capacity/.test(message)
  );
}

function createOpenRouterRequestError(error: unknown, attemptedModels: string[]) {
  const message = getProviderErrorMessage(error);

  if (/OPENROUTER_API_KEY/i.test(message)) {
    return new Error("Missing OPENROUTER_API_KEY.");
  }

  if (isProviderUnavailableError(error)) {
    const modelList = attemptedModels.join(", ");
    return new Error(
      `OpenRouter could not reach the current provider for ${modelList}. Try again in a moment, or switch to a different model in OPENROUTER_MODEL/OPENROUTER_MODELS. Free models often return 503 when provider capacity is exhausted.`,
    );
  }

  return new Error(message);
}

async function requestStructuredJson({
  systemPrompt,
  userPrompt,
  maxTokens,
}: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}) {
  const client = getOpenRouterClient();
  const models = getOpenRouterModels();
  try {
    const completion = await client.chat.send({
      chatRequest: {
        ...(models.length === 1 ? { model: models[0] } : { models }),
        temperature: 0.35,
        maxTokens,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
    });

    const rawContent = completion.choices[0]?.message?.content;
    const text = extractChatText(rawContent);

    if (!text.trim()) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return JSON.parse(extractJsonObject(text)) as Record<string, unknown>;
  } catch (error) {
    throw createOpenRouterRequestError(error, models);
  }
}

async function generateFreshSummary(blogId: string): Promise<BlogAiSummary> {
  const post = await getBlogById(blogId);

  if (!post) {
    throw new Error("Blog not found.");
  }

  const contentSignature = buildBlogContentSignature({
    id: post.id,
    title: post.title,
    content: post.content,
    updatedAt: post.updated_at,
  });

  const parsed = await requestStructuredJson({
    systemPrompt:
      "You summarize portfolio blog posts. Return valid JSON only. Keep the tone premium, crisp, and clear. Never include markdown fences.",
    userPrompt: `
Create a structured summary for this blog post.

Return JSON with this exact shape:
{
  "headline": "short premium heading",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "quickSummary": "2-4 sentence summary",
  "takeaway": "1-2 sentence takeaway",
  "suggestedPrompts": ["prompt 1", "prompt 2", "prompt 3", "prompt 4"]
}

Rules:
- Exactly 3 key points.
- Key points must be short, specific, and high-signal.
- Suggested prompts must be short chat follow-ups a reader would actually tap.
- Do not mention that you are an AI.

Blog title: ${post.title}
Category: ${post.category}
Content:
${stripBlogContentForAi(post.content)}
    `.trim(),
    maxTokens: 700,
  });

  return {
    headline: sanitizeAssistantText(String(parsed.headline ?? ""), `${post.title} at a glance`),
    keyPoints: normalizeKeyPoints(
      Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map((item) => String(item)) : [],
      3,
    ),
    quickSummary: sanitizeAssistantText(
      String(parsed.quickSummary ?? ""),
      "This post shares the core idea, why it matters, and the main details worth remembering.",
    ),
    takeaway: sanitizeAssistantText(
      String(parsed.takeaway ?? ""),
      "The biggest value here is understanding the main idea and applying the useful insight from it.",
    ),
    suggestedPrompts: normalizePromptSuggestions(
      Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts.map((item) => String(item)) : [],
    ),
    generatedAt: new Date().toISOString(),
    model: getOpenRouterModels().join(", "),
    contentSignature,
  };
}

const getCachedSummary = unstable_cache(
  async (blogId: string, contentSignature: string) => {
    const summary = await generateFreshSummary(blogId);

    if (summary.contentSignature !== contentSignature) {
      return generateFreshSummary(blogId);
    }

    return summary;
  },
  ["blog-ai-summary"],
  { revalidate: SUMMARY_CACHE_REVALIDATE_SECONDS },
);

async function generateChatReply(blogId: string, messages: BlogAiMessage[]): Promise<BlogAiChatResponse> {
  const post = await getBlogById(blogId);

  if (!post) {
    throw new Error("Blog not found.");
  }

  const contentSignature = buildBlogContentSignature({
    id: post.id,
    title: post.title,
    content: post.content,
    updatedAt: post.updated_at,
  });

  const summary = await getCachedSummary(blogId, contentSignature);
  const recentMessages = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const parsed = await requestStructuredJson({
    systemPrompt:
      "You are a concise blog assistant. Answer based on the blog post context. Return valid JSON only, never markdown fences.",
    userPrompt: `
Answer the reader's follow-up based on this blog post.

Return JSON with this exact shape:
{
  "message": "short helpful answer",
  "suggestedReplies": ["reply 1", "reply 2", "reply 3", "reply 4"]
}

Rules:
- Keep the answer under 140 words unless the user explicitly asks for more detail.
- Be direct, useful, and easy to scan.
- Suggested replies should be short and tap-friendly.
- If the answer is not clearly in the blog, say that briefly and give the best grounded answer possible.

Blog title: ${post.title}
Category: ${post.category}
Summary headline: ${summary.headline}
Key points: ${summary.keyPoints.join(" | ")}
Quick summary: ${summary.quickSummary}
Takeaway: ${summary.takeaway}
Blog content:
${stripBlogContentForAi(post.content, 9000)}

Conversation:
${recentMessages}
    `.trim(),
    maxTokens: 450,
  });

  return {
    message: sanitizeAssistantText(
      String(parsed.message ?? ""),
      "This blog focuses on the main idea, the key supporting details, and why those details matter.",
    ),
    suggestedReplies: normalizePromptSuggestions(
      Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies.map((item) => String(item)) : [],
    ),
    generatedAt: new Date().toISOString(),
    model: getOpenRouterModels().join(", "),
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as RequestPayload;
    const mode = payload.mode ?? "summary";

    if (mode === "chat") {
      const messages = Array.isArray(payload.messages) ? payload.messages : [];

      if (messages.length === 0) {
        return NextResponse.json({ error: "At least one chat message is required." }, { status: 400 });
      }

      const response = await generateChatReply(id, messages);
      return NextResponse.json({ chat: response });
    }

    const post = await getBlogById(id);

    if (!post) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const contentSignature =
      payload.contentSignature ||
      buildBlogContentSignature({
        id: post.id,
        title: post.title,
        content: post.content,
        updatedAt: post.updated_at,
      });

    const summary = await getCachedSummary(id, contentSignature);

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate AI response right now.";
    const isConfigurationError = /OPENROUTER_API_KEY/i.test(message);
    const isProviderError = /OpenRouter could not reach the current provider/i.test(message);

    return NextResponse.json(
      {
        error: isConfigurationError
          ? "Add OPENROUTER_API_KEY to your env file to enable blog AI summaries."
          : message,
      },
      { status: isConfigurationError || isProviderError ? 503 : 500 },
    );
  }
}
