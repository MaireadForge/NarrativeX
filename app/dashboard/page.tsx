import { getServerSession } from "next-auth";

import SignOutButton from "@/app/dashboard/SignOutButton";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "there";

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {name}!
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This is a placeholder dashboard for Day 1. We&apos;ll build the real
              experience on Day 5.
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

