import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RegisterBody | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
}

