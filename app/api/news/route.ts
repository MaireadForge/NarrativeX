import { NextResponse } from "next/server";

import { fetchAndStoreArticles, getArticles } from "@/lib/articleService";
import connectDB from "@/lib/db";
import Article from "@/models/Article";

function parseBoolean(value: string | null): boolean {
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "yes";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") ?? undefined;
    const pageRaw = searchParams.get("page");
    const refresh = parseBoolean(searchParams.get("refresh"));

    const page = pageRaw ? Number(pageRaw) : 1;

    await connectDB();

    if (refresh) {
      await fetchAndStoreArticles(category ?? "general");
    } else {
      const filter: Record<string, unknown> = {};
      if (category) filter.category = category;

      const existingCount = await Article.countDocuments(filter);
      if (existingCount === 0) {
        await fetchAndStoreArticles(category ?? "general");
      }
    }

    const result = await getArticles(category, page);

    return NextResponse.json({
      ...result,
      category: category ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

