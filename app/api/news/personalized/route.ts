import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");
    const country = searchParams.get("country") ?? "us";

    const page = pageRaw ? Math.max(1, Math.floor(Number(pageRaw))) : 1;
    const limit = limitRaw ? Math.max(1, Math.floor(Number(limitRaw))) : 10;
    const skip = (page - 1) * limit;

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("interests readHistory")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interests = user.interests ?? [];
    const readIds = (user.readHistory ?? []).map((entry) => entry.articleId);

    const filter: Record<string, unknown> = {};

    if (country === "us") {
      filter.$or = [{ country: "us" }, { country: { $exists: false } }];
    } else {
      filter.country = country;
    }

    if (interests.length > 0) {
      filter.category = { $in: interests };
    }

    if (readIds.length > 0) {
      const objectIds = readIds
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (objectIds.length > 0) {
        filter._id = { $nin: objectIds };
      }
    }

    const [articles, totalCount] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return NextResponse.json({
      articles: articles.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        description: a.description ?? "",
        url: a.url,
        urlToImage: a.urlToImage ?? "",
        source: {
          id: a.source?.id ?? "",
          name: a.source?.name ?? "",
        },
        category: a.category ?? "general",
        publishedAt: a.publishedAt,
        aiSummary: a.aiSummary ?? "",
      })),
      totalCount,
      page,
      totalPages,
      basedOn: interests,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
