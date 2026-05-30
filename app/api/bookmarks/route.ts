import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import User from "@/models/User";

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("bookmarks").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookmarkIds = (user.bookmarks ?? []).filter((id) =>
      mongoose.isValidObjectId(id)
    );

    if (bookmarkIds.length === 0) {
      return NextResponse.json({ bookmarks: [] });
    }

    const objectIds = bookmarkIds.map((id) => new mongoose.Types.ObjectId(id));

    const articles = await Article.find({ _id: { $in: objectIds } })
      .sort({ publishedAt: -1 })
      .lean();

    return NextResponse.json({
      bookmarks: articles.map(mapArticle),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type BookmarkBody = {
  articleId?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as BookmarkBody | null;
    const articleId = body?.articleId?.trim();

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(articleId)) {
      return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });
    }

    await connectDB();

    const article = await Article.findById(articleId).lean();
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id).select("bookmarks").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isBookmarked = (user.bookmarks ?? []).includes(articleId);

    if (isBookmarked) {
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { bookmarks: articleId },
      });
      return NextResponse.json({ bookmarked: false });
    }

    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { bookmarks: articleId },
    });
    return NextResponse.json({ bookmarked: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
