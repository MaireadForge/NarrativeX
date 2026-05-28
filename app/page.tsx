export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">
          NarrativeX — News Intelligence Platform
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Day 1 foundation is set up. Next: authentication, onboarding, and your
          dashboard experience.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Login
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
