import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    await connectDB();

    const articles = await Article.find()
      .sort({ publishedAt: -1 })
      .limit(50)
      .select("title description")
      .lean();

    const titles = articles
      .map((a) => a.title)
      .filter((title): title is string => Boolean(title));

    if (titles.length === 0) {
      return NextResponse.json({ trending: [], generatedAt: new Date() });
    }

    const prompt = [
      "You are a news intelligence analyst.",
      "Given the following article titles from recent news, extract the top 8 trending topics or entities being discussed.",
      "Return ONLY a JSON array of strings, nothing else.",
      'Example output format: ["AI regulation", "Apple", "NBA Finals", "Federal Reserve"]',
      "",
      "Titles:",
      ...titles.map((title, i) => `${i + 1}. ${title}`),
    ].join("\n");

    let trending: string[] = [];

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.2,
      });

      const content = completion.choices?.[0]?.message?.content ?? "";
      trending = parseTrendingJson(content);
    } catch {
      trending = [];
    }

    return NextResponse.json({
      trending,
      generatedAt: new Date(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
