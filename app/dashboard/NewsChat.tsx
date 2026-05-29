"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type ChatSource = {
  title: string;
  url: string;
  source: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};

type ChatApiResponse = {
  reply: string;
  sourcesUsed: ChatSource[];
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm your AI news assistant. Ask me anything about current events — like 'What's happening with AI today?' or 'Summarize today's business news'",
};

const SUGGESTIONS = [
  "What's trending in tech?",
  "Latest business news",
  "What happened in sports today?",
] as const;

export default function NewsChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = messages.some((message) => message.role === "user");

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = (await res.json().catch(() => null)) as
        | ChatApiResponse
        | { error?: string }
        | null;

      if (!res.ok) {
        const errorText =
          data && "error" in data && data.error
            ? data.error
            : "Failed to get a response.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorText },
        ]);
        return;
      }

      if (!data || !("reply" in data)) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to get a response." },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sourcesUsed.length > 0 ? data.sourcesUsed : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="h-96 space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                message.role === "user"
                  ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                  : "border border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.role === "assistant" && message.sources?.length ? (
                <div className="mt-2 space-y-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Sources
                  </p>
                  {message.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
                    >
                      {source.title} — {source.source}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Thinking...
            </div>
          </div>
        ) : null}
      </div>

      {!hasUserMessages ? (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              disabled={loading}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the news..."
          disabled={loading}
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-600"
        />
        <button
          type="button"
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}
