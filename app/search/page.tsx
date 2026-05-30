import Link from "next/link";

import BookmarkButton from "@/app/dashboard/BookmarkButton";
import SearchBar from "@/app/search/SearchBar";

type SearchArticle = {
  _id: string;
  title: string;
  description: string;
  aiSummary: string;
  url: string;
  urlToImage: string;
  source: { id: string; name: string };
  category: string;
  publishedAt: string;
};

type SearchResponse = {
  articles: SearchArticle[];
  totalCount: number;
  page: number;
  totalPages: number;
  query: string;
};

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "technology", label: "Technology" },
  { value: "sports", label: "Sports" },
  { value: "business", label: "Business" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "entertainment", label: "Entertainment" },
] as const;

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

function buildSearchUrl(q: string, category?: string, page?: number): string {
  const params = new URLSearchParams();
  params.set("q", q);
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

async function fetchSearchResults(
  q: string,
  category?: string,
  page: number = 1
): Promise<SearchResponse> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ q, page: String(page), limit: "10" });
  if (category) params.set("category", category);

  const res = await fetch(`${baseUrl}/api/search?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { articles: [], totalCount: 0, page: 1, totalPages: 0, query: q };
  }

  return (await res.json()) as SearchResponse;
}

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const page = params.page ? Math.max(1, Math.floor(Number(params.page))) : 1;

  const results = q
    ? await fetchSearchResults(q, category || undefined, page)
    : { articles: [], totalCount: 0, page: 1, totalPages: 0, query: "" };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Search</h1>
        </div>

        <SearchBar initialValue={q} />

        {q ? (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive =
                cat.value === "" ? !category : category === cat.value;
              const href = buildSearchUrl(q, cat.value || undefined, 1);

              return (
                <Link
                  key={cat.label}
                  href={href}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        ) : null}

        {q ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {results.totalCount} result{results.totalCount === 1 ? "" : "s"} for
            &ldquo;{q}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter a search term to find articles.
          </p>
        )}

        {q && results.articles.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No results found for &ldquo;{q}&rdquo;.
            </p>
          </div>
        ) : null}

        {results.articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {results.articles.map((article) => (
              <div
                key={article._id}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div className="absolute right-3 top-3">
                  <BookmarkButton articleId={article._id} initialBookmarked={false} />
                </div>

                <div className="flex items-center justify-between gap-2 pr-10">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {article.source.name || "Unknown source"}
                  </span>
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs capitalize dark:border-zinc-700">
                    {article.category}
                  </span>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block"
                >
                  <h3 className="line-clamp-2 font-semibold leading-snug group-hover:underline">
                    {article.title}
                  </h3>
                </a>

                {article.aiSummary ? (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {article.aiSummary}
                  </p>
                ) : null}

                <p className="mt-3 text-xs text-zinc-500">
                  {formatRelativeTime(article.publishedAt)}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {results.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            {page > 1 ? (
              <Link
                href={buildSearchUrl(q, category || undefined, page - 1)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                Previous
              </Link>
            ) : null}
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {page} of {results.totalPages}
            </span>
            {page < results.totalPages ? (
              <Link
                href={buildSearchUrl(q, category || undefined, page + 1)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
