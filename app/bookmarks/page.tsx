import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import User from "@/models/User";

function formatRelativeTime(date: Date): string {
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

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("bookmarks").lean();
  const bookmarkIds = (user?.bookmarks ?? []).filter((id) =>
    mongoose.isValidObjectId(id)
  );

  const articles =
    bookmarkIds.length > 0
      ? await Article.find({
          _id: {
            $in: bookmarkIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        })
          .sort({ publishedAt: -1 })
          .lean()
      : [];

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
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Bookmarks</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Articles you&apos;ve saved for later
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No bookmarks yet. Save articles from your feed.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <a
                key={article._id.toString()}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {article.source?.name || "Unknown source"}
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

                <p className="mt-3 text-xs text-zinc-500">
                  {formatRelativeTime(article.publishedAt)}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
