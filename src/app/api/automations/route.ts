import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const automations = db.listAutomations(session.userId);
  return NextResponse.json({ automations });
}

export async function POST(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, topic_prompt, categories, perspective, length, frequency, model } = body;

  if (!name || !topic_prompt) {
    return NextResponse.json({ error: "Name and topic prompt are required" }, { status: 400 });
  }

  const automation = db.createAutomation(session.userId, {
    name,
    topic_prompt,
    categories: categories || [],
    perspective: perspective || "balanced",
    length: length || "standard",
    frequency: frequency || "daily",
    model: normalizeModel(model),
  });

  return NextResponse.json({ automation }, { status: 201 });
}
