"use client";

import { useCallback, useEffect, useState } from "react";



type FeedArticle = {
  _id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: { id: string; name: string };
  category: string;
  publishedAt: string;
  aiSummary: string;
};

type PersonalizedResponse = {
  articles: FeedArticle[];
  totalCount: number;
  page: number;
  totalPages: number;
  basedOn: string[];
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString();
}

async function markAsRead(articleId: string): Promise<void> {
  await fetch("/api/news/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function PersonalizedFeed() {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "10",
      });

      const res = await fetch(`/api/news/personalized?${params.toString()}`);
    const data = (await res.json().catch(() => null)) as
      | PersonalizedResponse
      | { error?: string }
      | null;

    if (!res.ok) {
      throw new Error(
        data && "error" in data && data.error ? data.error : "Failed to load feed"
      );
    }

    if (!data || !("articles" in data)) {
      throw new Error("Failed to load feed");
    }

    setArticles((prev) => (append ? [...prev, ...data.articles] : data.articles));
    setPage(data.page);
    setTotalPages(data.totalPages);
  },
    []
  );

 

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setArticles([]);
      setPage(1);
      try {
        await fetchPage(1, false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load feed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  async function handleLoadMore() {
    if (page >= totalPages || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleArticleOpen(articleId: string) {
    await markAsRead(articleId);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </p>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">No articles found</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <a
            key={article._id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleArticleOpen(article._id)}
            className="group block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {article.source.name || "Unknown source"}
              </span>
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs capitalize dark:border-zinc-700">
                {article.category}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-2 font-semibold leading-snug group-hover:underline">
              {article.title}
            </h3>

            {article.aiSummary ? (
              <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                {article.aiSummary}
              </p>
            ) : null}

            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
              {formatRelativeTime(article.publishedAt)}
            </p>
          </a>
        ))}
      </div>

      {page < totalPages ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
