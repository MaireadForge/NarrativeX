import { NextResponse } from "next/server";

import { CATEGORIES, fetchAndStoreArticles, type Category } from "@/lib/articleService";

export async function POST() {
  try {
    const results: Partial<Record<Category, number>> = {};

    for (const category of CATEGORIES) {
      const count = await fetchAndStoreArticles(category);
      results[category] = count;
    }

    return NextResponse.json({ results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

