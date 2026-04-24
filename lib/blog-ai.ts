import { createHash } from "node:crypto";

export type BlogAiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BlogAiSummary = {
  headline: string;
  keyPoints: string[];
  quickSummary: string;
  takeaway: string;
  suggestedPrompts: string[];
  generatedAt: string;
  model: string;
  contentSignature: string;
};

export type BlogAiChatResponse = {
  message: string;
  suggestedReplies: string[];
  generatedAt: string;
  model: string;
};

const DEFAULT_PROMPTS = [
  "Explain this blog in simple words.",
  "What are the main takeaways?",
  "Give me the fastest recap.",
  "Why does this matter?",
];

export function buildBlogContentSignature(input: {
  id: string;
  title: string;
  content: string;
  updatedAt?: string | null;
}) {
  return createHash("sha256")
    .update(`${input.id}::${input.title}::${input.updatedAt ?? ""}::${input.content}`)
    .digest("hex")
    .slice(0, 16);
}

export function getDefaultBlogPromptSuggestions() {
  return DEFAULT_PROMPTS;
}

export function normalizePromptSuggestions(items: string[] | undefined, limit = 4) {
  const merged = [...(items ?? []), ...DEFAULT_PROMPTS];
  const seen = new Set<string>();

  return merged
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

export function normalizeKeyPoints(items: string[] | undefined, limit = 3) {
  return (items ?? [])
    .map((item) => item.replace(/^[•\-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function sanitizeAssistantText(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

export function stripBlogContentForAi(content: string, maxLength = 12000) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<BlogTable[\s\S]*?\/>/g, " ")
    .replace(/<div\s+class=["']blog-image-grid["'][\s\S]*?<\/div>/gi, " ")
    .replace(/\!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<a\s+[^>]*href=["'][^"']+["'][^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function extractJsonObject(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON.");
  }

  return trimmed.slice(start, end + 1);
}
