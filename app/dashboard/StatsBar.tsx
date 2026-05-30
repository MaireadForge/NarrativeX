"use client";

import { useEffect, useState } from "react";

type Stats = {
  articlesRead: number;
  topicsFollowed: number;
  bookmarksSaved: number;
};

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-7 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/stats");
        const data = (await res.json().catch(() => null)) as Stats | null;
        if (res.ok && data) {
          setStats(data);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { label: "Articles read", value: stats.articlesRead },
    { label: "Topics followed", value: stats.topicsFollowed },
    { label: "Bookmarks saved", value: stats.bookmarksSaved },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
