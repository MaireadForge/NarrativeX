import connectDB from "@/lib/db";
import { groq } from "@/lib/groq";
import Article from "@/models/Article";

function parseTrendingJson(raw: string): string[] {
  try {
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    const candidate = jsonMatch ? jsonMatch[0] : trimmed;

    const parsed: unknown = JSON.parse(candidate);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

async function fetchTrendingTopics(): Promise<string[]> {
  await connectDB();

  const articles = await Article.find()
    .sort({ publishedAt: -1 })
    .limit(50)
    .select("title description")
    .lean();

  const titles = articles
    .map((a) => a.title)
    .filter((title): title is string => Boolean(title));

  if (titles.length === 0) return [];

  const prompt = [
    "You are a news intelligence analyst.",
    "Given the following article titles from recent news, extract the top 8 trending topics or entities being discussed.",
    "Return ONLY a JSON array of strings, nothing else.",
    'Example output format: ["AI regulation", "Apple", "NBA Finals", "Federal Reserve"]',
    "",
    "Titles:",
    ...titles.map((title, i) => `${i + 1}. ${title}`),
  ].join("\n");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return parseTrendingJson(content);
  } catch {
    return [];
  }
}

export default async function TrendingTopics() {
  const trending = await fetchTrendingTopics();

  if (trending.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No trending topics available right now.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {trending.map((topic) => (
        <span
          key={topic}
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
