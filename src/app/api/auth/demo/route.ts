import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, tokenCookieHeader } from "@/lib/auth";

export async function POST() {
  try {
    await db.ensure();

    const email = "demo@newsflow.app";
    let user = db.getUserByEmail(email);

    if (!user) {
      const hash = await bcrypt.hash("demo123", 10);
      const created = db.createUser(email, hash, "Demo User");
      user = db.getUserByEmail(email)!;
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    res.headers.set("Set-Cookie", tokenCookieHeader(token));
    return res;
  } catch (e) {
    console.error("Demo login error:", e);
    return NextResponse.json({ error: "Demo login failed" }, { status: 500 });
  }
}
