import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const automation = db.getAutomation(id, session.userId);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (automation.share_code) {
    return NextResponse.json({ share_code: automation.share_code });
  }

  const code = randomUUID().split("-")[0];
  db.setShareCode(id, session.userId, code);

  return NextResponse.json({ share_code: code });
}
