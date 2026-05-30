import Link from "next/link";
import { getServerSession } from "next-auth";

import NewsChat from "@/app/dashboard/NewsChat";
import PersonalizedFeed from "@/app/dashboard/PersonalizedFeed";
import SignOutButton from "@/app/dashboard/SignOutButton";
import StatsBar from "@/app/dashboard/StatsBar";
import TrendingTopics from "@/app/dashboard/TrendingTopics";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "there";
  const hour = new Date().getHours();
  const greeting = getGreeting(hour);

  let interests: string[] = [];

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select("interests").lean();
    interests = user?.interests ?? [];
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting}, {name}!
            </h1>
            {interests.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium capitalize dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                No interests selected yet. Visit onboarding to personalize your feed.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/bookmarks"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              Bookmarks
            </Link>
            <SignOutButton />
          </div>
        </div>

        <StatsBar />

        <Link
          href="/search"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <span aria-hidden>🔍</span>
          <span>Search articles...</span>
        </Link>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold tracking-tight">Trending Now</h2>
          <div className="mt-4">
            <TrendingTopics />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold tracking-tight">Your Feed</h2>
          <div className="mt-4">
            <PersonalizedFeed />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold tracking-tight">Ask AI About the News</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Chat with your personal news assistant
          </p>
          <div className="mt-4">
            <NewsChat />
          </div>
        </section>
      </div>
    </div>
  );
}
