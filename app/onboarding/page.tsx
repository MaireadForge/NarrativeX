"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INTEREST_OPTIONS = [
  { id: "technology", label: "Technology", emoji: "💻" },
  { id: "sports", label: "Sports", emoji: "🏆" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "health", label: "Health", emoji: "🏥" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬" },
] as const;

type InterestId = (typeof INTEREST_OPTIONS)[number]["id"];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<InterestId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleInterest(id: InterestId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    if (selected.length === 0) {
      setError("Please select at least one interest to continue.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected }),
      });

      const data = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!res.ok) {
        setError(data?.error ?? "Failed to save interests.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Failed to save interests.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">
          What are you interested in?
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pick topics to personalize your feed
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INTEREST_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInterest(option.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition-colors ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {option.emoji}
                </span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
