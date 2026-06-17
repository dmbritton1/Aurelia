import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasKey = db.hasGeminiApiKey(session.userId);
  const key = db.getGeminiApiKey(session.userId);

  return NextResponse.json({
    hasKey,
    maskedKey: key ? key.slice(0, 6) + "..." + key.slice(-4) : null,
  });
}

export async function POST(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
    return NextResponse.json({ error: "Please provide a valid Gemini API key" }, { status: 400 });
  }

  db.setGeminiApiKey(session.userId, apiKey.trim());

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  db.setGeminiApiKey(session.userId, "");

  return NextResponse.json({ ok: true });
}
