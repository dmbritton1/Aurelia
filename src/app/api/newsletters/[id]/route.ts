import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const newsletter = db.getNewsletter(id);
  if (!newsletter) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const automation = db.getAutomationById(newsletter.automation_id as string);
  if (!automation || automation.user_id !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ newsletter, automation });
}
