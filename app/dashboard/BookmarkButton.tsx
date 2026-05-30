"use client";

import { useState, type MouseEvent } from "react";

type BookmarkButtonProps = {
  articleId: string;
  initialBookmarked: boolean;
};

export default function BookmarkButton({
  articleId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const previous = bookmarked;
    setBookmarked(!bookmarked);
    setLoading(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });

      const data = (await res.json().catch(() => null)) as
        | { bookmarked?: boolean }
        | { error?: string }
        | null;

      if (!res.ok || !data || !("bookmarked" in data)) {
        setBookmarked(previous);
        return;
      }

      setBookmarked(data.bookmarked ?? previous);
    } catch {
      setBookmarked(previous);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-colors disabled:opacity-60 ${
        bookmarked
          ? "border-zinc-950 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-900"
          : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      }`}
    >
      🔖
    </button>
  );
}
