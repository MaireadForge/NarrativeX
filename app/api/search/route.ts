import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Article from "@/models/Article";

const VALID_CATEGORIES = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
  "general",
] as const;

function isValidCategory(category: string): boolean {
  return (VALID_CATEGORIES as readonly string[]).includes(category);
}

function mapArticle(a: {
  _id: { toString(): string };
  title: string;
  description?: string;
  aiSummary?: string;
  url: string;
  urlToImage?: string;
  source?: { id?: string; name?: string };
  category?: string;
  publishedAt: Date;
}) {
  return {
    _id: a._id.toString(),
    title: a.title,
    description: a.description ?? "",
    aiSummary: a.aiSummary ?? "",
    url: a.url,
    urlToImage: a.urlToImage ?? "",
    source: {
      id: a.source?.id ?? "",
      name: a.source?.name ?? "",
    },
    category: a.category ?? "general",
    publishedAt: a.publishedAt,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category") ?? undefined;
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");

    const page = pageRaw ? Math.max(1, Math.floor(Number(pageRaw))) : 1;
    const limit = limitRaw ? Math.max(1, Math.floor(Number(limitRaw))) : 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json({
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
        query: "",
      });
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      $text: { $search: q },
    };

    if (category && isValidCategory(category)) {
      filter.category = category;
    }

    const [articles, totalCount] = await Promise.all([
      Article.find(filter, { score: { $meta: "textScore" } })
        .select("title description aiSummary url urlToImage source category publishedAt")
        .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;

    return NextResponse.json({
      articles: articles.map(mapArticle),
      totalCount,
      page,
      totalPages,
      query: q,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
