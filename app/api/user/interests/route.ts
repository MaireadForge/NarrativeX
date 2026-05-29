import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

const VALID_INTERESTS = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
] as const;

type ValidInterest = (typeof VALID_INTERESTS)[number];

function isValidInterest(value: string): value is ValidInterest {
  return (VALID_INTERESTS as readonly string[]).includes(value);
}

type InterestsBody = {
  interests?: unknown;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("interests").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ interests: user.interests ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as InterestsBody | null;

    if (!body || !Array.isArray(body.interests)) {
      return NextResponse.json(
        { error: "interests must be an array" },
        { status: 400 }
      );
    }

    const interests = body.interests;

    if (!interests.every((item): item is string => typeof item === "string")) {
      return NextResponse.json(
        { error: "Each interest must be a string" },
        { status: 400 }
      );
    }

    if (!interests.every(isValidInterest)) {
      return NextResponse.json(
        {
          error:
            "Invalid interest. Allowed: technology, sports, business, health, science, entertainment",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { interests },
      { new: true }
    )
      .select("interests")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interests: updated.interests ?? [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
