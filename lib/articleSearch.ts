import connectDB from "@/lib/db";
import Article from "@/models/Article";

export type Article = {
  _id: string;
  title: string;
  description: string;
  aiSummary: string;
  url: string;
  source: { id: string; name: string };
  category: string;
  publishedAt: Date;
};

const PROJECTION =
  "title description aiSummary url source category publishedAt" as const;

function mapArticle(
  doc: {
    _id: { toString(): string };
    title: string;
    description?: string;
    aiSummary?: string;
    url: string;
    source?: { id?: string; name?: string };
    category?: string;
    publishedAt: Date;
  }
): Article {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? "",
    aiSummary: doc.aiSummary ?? "",
    url: doc.url,
    source: {
      id: doc.source?.id ?? "",
      name: doc.source?.name ?? "",
    },
    category: doc.category ?? "general",
    publishedAt: doc.publishedAt,
  };
}

export async function searchArticles(
  query: string,
  limit: number = 5
): Promise<Article[]> {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];

    await connectDB();

    const safeLimit = Math.max(1, Math.floor(limit));

    const textResults = await Article.find(
      { $text: { $search: trimmed } },
      { score: { $meta: "textScore" } }
    )
      .select(PROJECTION)
      .sort({ score: { $meta: "textScore" } })
      .limit(safeLimit)
      .lean();

    if (textResults.length > 0) {
      return textResults.map(mapArticle);
    }

    const regexResults = await Article.find({
      title: { $regex: trimmed, $options: "i" },
    })
      .select(PROJECTION)
      .sort({ publishedAt: -1 })
      .limit(safeLimit)
      .lean();

    return regexResults.map(mapArticle);
  } catch {
    return [];
  }
}
