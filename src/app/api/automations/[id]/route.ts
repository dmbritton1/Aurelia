import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const automation = db.getAutomation(id, session.userId);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newsletters = db.listNewsletters(id);
  return NextResponse.json({ automation, newsletters });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const automation = db.updateAutomation(id, session.userId, body);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ automation });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  db.deleteAutomation(id, session.userId);
  return NextResponse.json({ ok: true });
}
