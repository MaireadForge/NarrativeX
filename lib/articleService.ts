import connectDB from "@/lib/db";
import { deduplicateArticles } from "@/lib/deduplication";
import { generateArticleSummary } from "@/lib/groq";
import { fetchNewsByCategory, type NewsAPIArticle } from "@/lib/newsapi";
import Article from "@/models/Article";

export const CATEGORIES = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
  "general",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type FetchStatus = Record<Category, Date | null>;

function isCategory(category: string): category is Category {
  return (CATEGORIES as readonly string[]).includes(category);
}

export async function fetchAndStoreArticles(category: string): Promise<number> {
  const effectiveCategory: Category = isCategory(category) ? category : "general";

  await connectDB();

  const fetched = await fetchNewsByCategory(effectiveCategory);
  const deduped = deduplicateArticles(fetched);

  let createdCount = 0;

  for (const a of deduped) {
    if (!a.url) continue;

    const exists = await Article.exists({ url: a.url });
    if (exists) continue;

    const title = a.title ?? "";
    const description = a.description ?? "";
    const content = a.content ?? "";

    const aiSummary = await generateArticleSummary(title, description, content);

    await Article.create({
      title,
      description: description || "",
      content: content || "",
      url: a.url,
      urlToImage: a.urlToImage ?? "",
      source: { id: a.source?.id ?? "", name: a.source?.name ?? "" },
      category: effectiveCategory,
      publishedAt: new Date(a.publishedAt),
      aiSummary,
      summaryGeneratedAt: aiSummary ? new Date() : undefined,
      fetchedAt: new Date(),
    });

    createdCount++;
  }

  return createdCount;
}

export async function getArticles(
  category?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  articles: Array<{
    _id: string;
    title: string;
    description: string;
    content: string;
    url: string;
    urlToImage: string;
    source: { id: string; name: string };
    category: string;
    publishedAt: Date;
    aiSummary: string;
    summaryGeneratedAt?: Date;
    fetchedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
  totalCount: number;
  page: number;
  totalPages: number;
}> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const skip = (safePage - 1) * safeLimit;

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (category && isCategory(category)) {
    filter.category = category;
  }

  const [articles, totalCount] = await Promise.all([
    Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Article.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));

  return {
    articles: articles.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description ?? "",
      content: a.content ?? "",
      url: a.url,
      urlToImage: a.urlToImage ?? "",
      source: {
        id: a.source?.id ?? "",
        name: a.source?.name ?? "",
      },
      category: a.category ?? "general",
      publishedAt: a.publishedAt,
      aiSummary: a.aiSummary ?? "",
      summaryGeneratedAt: a.summaryGeneratedAt ?? undefined,
      fetchedAt: a.fetchedAt ?? a.createdAt ?? new Date(0),
      createdAt: a.createdAt ?? new Date(0),
      updatedAt: a.updatedAt ?? new Date(0),
    })),
    totalCount,
    page: safePage,
    totalPages,
  };
}

