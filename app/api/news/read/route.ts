import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import User from "@/models/User";

type ReadBody = {
  articleId?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as ReadBody | null;
    const articleId = body?.articleId?.trim();

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    await connectDB();

    const article = await Article.findById(articleId).lean();
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id).select("readHistory").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyRead = (user.readHistory ?? []).some(
      (entry) => entry.articleId === articleId
    );

    if (!alreadyRead) {
      await User.findByIdAndUpdate(session.user.id, {
        $push: {
          readHistory: { articleId, readAt: new Date() },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Article marked as read",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
