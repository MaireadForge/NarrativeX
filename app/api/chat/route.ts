import { NextResponse } from "next/server";

import { chatWithNews, type ChatMessage } from "@/lib/chatService";

type ChatBody = {
  message?: string;
  history?: ChatMessage[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as ChatBody | null;

    const message = body?.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const history = Array.isArray(body?.history)
      ? body.history.filter(
          (item): item is ChatMessage =>
            Boolean(item) &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
        )
      : [];

    const { reply, sourcesUsed } = await chatWithNews(message, history);

    return NextResponse.json({
      reply,
      sourcesUsed: sourcesUsed.map((article) => ({
        title: article.title,
        url: article.url,
        source: article.source.name || "Unknown source",
      })),
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
