"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageSquareText, RefreshCcw, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiquidMetalButton } from "@/components/ui/liquid-metal";
import { cn } from "@/lib/utils";
import type { BlogAiMessage, BlogAiSummary } from "@/lib/blog-ai";

type ChatMessage = BlogAiMessage & {
  id: string;
};

type BlogAiAssistantProps = {
  blogId: string;
  blogTitle: string;
  contentSignature: string;
  defaultPrompts: string[];
};

const SUMMARY_CACHE_VERSION = "v1";
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const aiMetalConfig = {
  colorBack: "#7e9dbd",
  colorTint: "#f6fbff",
  speed: 0.32,
  repetition: 4,
  distortion: 0.12,
  scale: 1,
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingText({
  text,
  animate,
  className,
  speed = 12,
  onProgress,
  onComplete,
}: {
  text: string;
  animate: boolean;
  className?: string;
  speed?: number;
  onProgress?: () => void;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      onProgress?.();

      if (index >= text.length) {
        window.clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [animate, onComplete, onProgress, speed, text]);

  return (
    <p className={className}>
      {displayed}
      {animate && displayed.length < text.length ? <span className="blog-ai-caret" aria-hidden="true" /> : null}
    </p>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="blog-ai-shimmer h-5 w-36 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="blog-ai-shimmer h-4 w-24 rounded-full" />
            <div className="mt-4 space-y-2">
              <div className="blog-ai-shimmer h-3 w-full rounded-full" />
              <div className="blog-ai-shimmer h-3 w-5/6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="blog-ai-shimmer h-4 w-28 rounded-full" />
          <div className="mt-4 space-y-2">
            <div className="blog-ai-shimmer h-3 w-full rounded-full" />
            <div className="blog-ai-shimmer h-3 w-11/12 rounded-full" />
            <div className="blog-ai-shimmer h-3 w-10/12 rounded-full" />
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="blog-ai-shimmer h-4 w-24 rounded-full" />
          <div className="mt-4 space-y-2">
            <div className="blog-ai-shimmer h-3 w-full rounded-full" />
            <div className="blog-ai-shimmer h-3 w-4/5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickPromptChips({
  prompts,
  onClick,
  disabled,
}: {
  prompts: string[];
  onClick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onClick(prompt)}
          disabled={disabled}
          className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-text-primary transition hover:border-[#89AACC]/40 hover:bg-[#89AACC]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function AssistantBubble({
  content,
  animate,
  onProgress,
  onComplete,
}: {
  content: string;
  animate: boolean;
  onProgress?: () => void;
  onComplete?: () => void;
}) {
  return (
    <div className="max-w-full rounded-[22px] border border-[#89AACC]/20 bg-[#89AACC]/10 px-4 py-3 text-sm leading-6 text-text-primary">
      <TypingText
        text={content}
        animate={animate}
        className="min-h-6 whitespace-pre-wrap"
        speed={10}
        onProgress={onProgress}
        onComplete={onComplete}
      />
    </div>
  );
}

function PromptComposer({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#aac7e5]">Ask your own prompt</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!disabled) {
              onSubmit();
            }
          }
        }}
        rows={3}
        maxLength={700}
        placeholder="Ask anything about this blog..."
        className="mt-3 min-h-[96px] w-full resize-none rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-muted focus:border-[#89AACC]/35 focus:bg-black/30"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Press Enter to send. Use Shift+Enter for a new line.</p>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="h-10 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/14 px-4 text-sm text-text-primary hover:bg-[#89AACC]/22"
        >
          {disabled ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>
    </div>
  );
}

export function BlogAiAssistant({
  blogId,
  blogTitle,
  contentSignature,
  defaultPrompts,
}: BlogAiAssistantProps) {
  const summaryCacheKey = useMemo(
    () => `blog-ai-summary:${SUMMARY_CACHE_VERSION}:${blogId}:${contentSignature}`,
    [blogId, contentSignature],
  );
  const fallbackPrompts = useMemo(() => defaultPrompts.slice(0, 4), [defaultPrompts]);

  const [summary, setSummary] = useState<BlogAiSummary | null>(null);
  const [animateSummary, setAnimateSummary] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>(fallbackPrompts);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isDesktopPopupOpen, setIsDesktopPopupOpen] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [error, setError] = useState("");
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopBottomRef = useRef<HTMLDivElement | null>(null);
  const mobileBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const cachedValue = window.localStorage.getItem(summaryCacheKey);

      if (!cachedValue) {
        return;
      }

      const parsed = JSON.parse(cachedValue) as BlogAiSummary;
      if (parsed.contentSignature !== contentSignature) {
        window.localStorage.removeItem(summaryCacheKey);
        return;
      }

      setSummary(parsed);
      setAnimateSummary(false);
      setFollowUpPrompts(parsed.suggestedPrompts.length > 0 ? parsed.suggestedPrompts : fallbackPrompts);
    } catch {
      window.localStorage.removeItem(summaryCacheKey);
    }
  }, [contentSignature, fallbackPrompts, summaryCacheKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    if (!isDesktopPopupOpen || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopPopupOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDesktopPopupOpen]);

  const scrollConversationToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (typeof window === "undefined") {
      return;
    }

    if (isMobileViewport) {
      mobileBottomRef.current?.scrollIntoView({ behavior, block: "end" });
      return;
    }

    if (!isDesktopPopupOpen) {
      return;
    }

    const desktopScroller = desktopScrollRef.current;
    if (desktopScroller) {
      desktopScroller.scrollTo({
        top: desktopScroller.scrollHeight,
        behavior,
      });
    }

    desktopBottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const mergedPrompts = useMemo(() => {
    const items = [...followUpPrompts, ...(summary?.suggestedPrompts ?? []), ...fallbackPrompts];
    return items
      .filter((item, index) => items.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)
      .slice(0, 4);
  }, [fallbackPrompts, followUpPrompts, summary?.suggestedPrompts]);

  const shouldShowPromptChips = !loadingSummary && !sendingMessage && !isAssistantTyping;

  useEffect(() => {
    const currentPanelOpen = isMobileViewport ? isMobilePanelOpen : isDesktopPopupOpen;
    if (!currentPanelOpen || typeof window === "undefined") {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollConversationToBottom(messages.length > 0 ? "smooth" : "auto");
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [
    isAssistantTyping,
    isDesktopPopupOpen,
    isMobilePanelOpen,
    isMobileViewport,
    loadingSummary,
    messages.length,
    sendingMessage,
    summary,
  ]);

  async function generateSummary(force = false) {
    if (loadingSummary || sendingMessage) {
      return;
    }

    if (summary && !force) {
      return;
    }

    setError("");
    setLoadingSummary(true);

    try {
      const response = await fetch(`/api/blogs/${blogId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summary",
          contentSignature,
        }),
      });

      let payload: any;
      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error(`Connection issue (${response.status}). Please try again.`);
      }

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error || "Unable to generate summary right now.");
      }

      setSummary(payload.summary);
      setAnimateSummary(true);
      setFollowUpPrompts(payload.summary.suggestedPrompts.length > 0 ? payload.summary.suggestedPrompts : fallbackPrompts);
      window.localStorage.setItem(summaryCacheKey, JSON.stringify(payload.summary));
      if (!isMobileViewport) {
        setIsDesktopPopupOpen(true);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate summary right now.");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || sendingMessage) {
      return;
    }

    if (!summary) {
      await generateSummary();
    }

    setError("");
    setSendingMessage(true);
    setIsAssistantTyping(false);

    const nextUserMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, nextUserMessage];
    setMessages(updatedMessages);
    setDraftMessage("");

    try {
      const response = await fetch(`/api/blogs/${blogId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          messages: updatedMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      let payload: any;
      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error(`Connection issue (${response.status}). Please try again.`);
      }

      if (!response.ok || !payload.chat) {
        throw new Error(payload.error || "Unable to answer right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: payload.chat!.message,
        },
      ]);
      setIsAssistantTyping(true);
      setFollowUpPrompts(payload.chat.suggestedReplies.length > 0 ? payload.chat.suggestedReplies : fallbackPrompts);
    } catch (caughtError) {
      setMessages((current) => current.filter((message) => message.id !== nextUserMessage.id));
      setIsAssistantTyping(false);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to answer right now.");
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <>
      <section className="mt-3 lg:hidden">
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
            isMobilePanelOpen
              ? "pointer-events-none max-h-0 -translate-y-2 opacity-0"
              : "max-h-40 translate-y-0 opacity-100",
          )}
          aria-hidden={isMobilePanelOpen}
          inert={isMobilePanelOpen ? true : undefined}
        >
          <LiquidMetalButton
            type="button"
            onClick={() => {
              setIsMobilePanelOpen(true);
              if (!summary) {
                void generateSummary();
              }
            }}
            className="w-full"
            innerClassName="w-full justify-between bg-[#050912]/98 px-4 py-3"
            labelClassName="w-full"
            size="md"
            borderWidth={2}
            metalConfig={aiMetalConfig}
            icon={<Sparkles className="h-4 w-4" />}
          >
            <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
              <span className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#cfe5fb]">
                  AI Summary
                </span>
                <span className="mt-2 block truncate text-sm text-muted">
                  {summary ? "Open cached recap and continue the chat." : "Open AI chat for a quick recap."}
                </span>
              </span>
              <span className="inline-flex h-9 shrink-0 items-center rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-primary">
                {loadingSummary ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Open"}
              </span>
            </span>
          </LiquidMetalButton>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out",
            isMobilePanelOpen
              ? "mt-3 max-h-[1600px] translate-y-0 scale-100 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 scale-[0.985] opacity-0",
          )}
          aria-hidden={!isMobilePanelOpen}
          inert={!isMobilePanelOpen ? true : undefined}
        >
          <div className="origin-top rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition-transform duration-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#cfe5fb]">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Summary
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">Ask anything or use quick prompts without leaving the blog.</p>
              </div>

              <Button
                onClick={() => setIsMobilePanelOpen(false)}
                disabled={loadingSummary}
                className="h-10 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/14 px-4 text-sm text-text-primary hover:bg-[#89AACC]/22"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>

            <div className="mt-4">
              {loadingSummary ? <SummarySkeleton /> : null}

              {!loadingSummary && !summary ? (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-black/20 px-4 py-4 text-sm text-muted">
                  Open this to get a quick AI recap, ask your own prompt, or use the ready-made suggestions below.
                </div>
              ) : null}

              {!loadingSummary && summary ? (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <h3 className="text-lg font-semibold text-text-primary">{summary.headline}</h3>
                    <div className="mt-4 space-y-3">
                      {summary.keyPoints.map((point, index) => (
                        <div key={`${point}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#89AACC]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#aac7e5]">Quick Summary</p>
                    <TypingText
                      text={summary.quickSummary}
                      animate={animateSummary}
                      className="mt-3 text-sm leading-7 text-muted"
                    />
                  </div>
                </div>
              ) : null}

              {messages.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {messages.map((message, index) => (
                    <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                      {message.role === "assistant" ? (
                        <AssistantBubble
                          content={message.content}
                          animate={index === messages.length - 1 && isAssistantTyping}
                          onComplete={() => setIsAssistantTyping(false)}
                        />
                      ) : (
                        <div className="max-w-full rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-text-primary">
                          {message.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {sendingMessage ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-[#89AACC]/10 px-4 py-3 text-sm text-muted">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              ) : null}

              <div ref={mobileBottomRef} />

              {shouldShowPromptChips ? (
                <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-[#aac7e5]" />
                    <p className="text-sm font-medium text-text-primary">Quick prompts</p>
                  </div>
                  <div className="mt-4">
                    <QuickPromptChips prompts={mergedPrompts} onClick={(prompt) => void sendMessage(prompt)} disabled={sendingMessage} />
                  </div>
                </div>
              ) : null}

              <div className="mt-4">
                <PromptComposer
                  value={draftMessage}
                  onChange={setDraftMessage}
                  onSubmit={() => void sendMessage(draftMessage)}
                  disabled={loadingSummary || sendingMessage}
                />
              </div>

              {error ? (
                <div className="mt-4 rounded-[18px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <LiquidMetalButton
          onClick={() => {
            setIsDesktopPopupOpen((current) => {
              const nextOpen = !current;
              if (nextOpen && !summary) {
                void generateSummary();
              }
              return nextOpen;
            });
          }}
          className="shadow-[0_20px_48px_rgba(0,0,0,0.42)]"
          innerClassName="bg-[#050914]/98"
          size="md"
          borderWidth={2}
          metalConfig={aiMetalConfig}
          icon={
            loadingSummary ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-[#dff2ff]" />
            ) : (
              <Sparkles className="h-4 w-4 text-[#dff2ff]" />
            )
          }
        >
          {isDesktopPopupOpen ? "Close AI" : summary ? "Open AI Chat" : "Open AI Summary"}
        </LiquidMetalButton>
      </div>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 hidden w-[min(430px,calc(100vw-3rem))] transition-[opacity,transform] duration-300 ease-out lg:block",
          isDesktopPopupOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-6 scale-[0.97] opacity-0",
        )}
        aria-hidden={!isDesktopPopupOpen}
        inert={!isDesktopPopupOpen ? true : undefined}
      >
        <div className="origin-bottom-right">
          <div className="flex h-[min(76vh,760px)] min-h-[560px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.16),transparent_42%),linear-gradient(180deg,rgba(15,20,30,0.98),rgba(10,14,22,0.96))] shadow-[0_24px_90px_rgba(0,0,0,0.42)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#aac7e5]">AI Summary</p>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary">{blogTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => generateSummary(true)}
                    disabled={loadingSummary || sendingMessage}
                    className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-text-primary hover:bg-white/[0.08]"
                  >
                    {loadingSummary ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDesktopPopupOpen(false)}
                    className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] p-0 text-text-primary hover:bg-white/[0.08]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div ref={desktopScrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {!summary && !loadingSummary ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm leading-6 text-muted">
                        Ask anything about this blog, or generate a quick premium recap first.
                      </p>
                    </div>
                  ) : null}

                  {!summary && !loadingSummary ? (
                    <Button
                      onClick={() => generateSummary()}
                      disabled={loadingSummary}
                      className="h-11 w-full rounded-full border border-[#89AACC]/30 bg-[#89AACC]/14 px-5 text-sm text-text-primary hover:bg-[#89AACC]/22"
                    >
                      {loadingSummary ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Generate Summary
                    </Button>
                  ) : null}

                  {loadingSummary ? <SummarySkeleton /> : null}

                  {summary ? (
                    <>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.24em] text-[#aac7e5]">Overview</p>
                            <h4 className="mt-2 text-xl font-semibold text-text-primary">{summary.headline}</h4>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-muted">
                            <Bot className="h-3.5 w-3.5" />
                            AI Assistant
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {summary.keyPoints.map((point, index) => (
                            <div key={`${point}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#89AACC]" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#aac7e5]">Quick Summary</p>
                        <TypingText
                          text={summary.quickSummary}
                          animate={animateSummary}
                          className="mt-3 text-sm leading-7 text-muted"
                        />
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#aac7e5]">Takeaway</p>
                        <TypingText
                          text={summary.takeaway}
                          animate={animateSummary}
                          className="mt-3 text-sm leading-7 text-muted"
                          speed={14}
                        />
                      </div>
                    </>
                  ) : null}

                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                        >
                          {message.role === "assistant" ? (
                            <AssistantBubble
                              content={message.content}
                              animate={index === messages.length - 1 && isAssistantTyping}
                              onComplete={() => setIsAssistantTyping(false)}
                            />
                          ) : (
                            <div className="max-w-full rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-text-primary">
                              {message.content}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {sendingMessage ? (
                    <div className="inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-[#89AACC]/10 px-4 py-3 text-sm text-muted">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  ) : null}

                  <div ref={desktopBottomRef} />

                  {shouldShowPromptChips ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-[#aac7e5]" />
                        <p className="text-sm font-medium text-text-primary">Quick prompts</p>
                      </div>
                      <div className="mt-4">
                        <QuickPromptChips prompts={mergedPrompts} onClick={(prompt) => void sendMessage(prompt)} disabled={sendingMessage} />
                      </div>
                    </div>
                  ) : null}

                  <PromptComposer
                    value={draftMessage}
                    onChange={setDraftMessage}
                    onSubmit={() => void sendMessage(draftMessage)}
                    disabled={loadingSummary || sendingMessage}
                  />

                  {error ? (
                    <div className="rounded-[18px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {error}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
