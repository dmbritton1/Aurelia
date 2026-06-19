import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

// E.164: leading + and 8–15 digits (first digit non-zero).
const E164 = /^\+[1-9]\d{7,14}$/;

function maskPhone(phone: string): string {
  return phone.length > 4 ? "•••• " + phone.slice(-4) : phone;
}

export async function GET(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone, sms_enabled } = db.getPhone(session.userId);
  return NextResponse.json({
    hasPhone: !!phone,
    maskedPhone: phone ? maskPhone(phone) : null,
    smsEnabled: sms_enabled,
  });
}

export async function POST(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone, smsEnabled } = await req.json();

  const normalized = typeof phone === "string" ? phone.replace(/[\s()-]/g, "") : "";
  if (!E164.test(normalized)) {
    return NextResponse.json(
      { error: "Enter a phone number in international format, e.g. +15551234567" },
      { status: 400 }
    );
  }

  db.setPhone(session.userId, normalized, smsEnabled !== false);
  return NextResponse.json({ ok: true, maskedPhone: maskPhone(normalized) });
}

// Toggle SMS on/off for the already-saved number, without re-entering it.
export async function PATCH(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { smsEnabled } = await req.json();
  const { phone } = db.getPhone(session.userId);
  if (!phone) {
    return NextResponse.json({ error: "No phone number on file" }, { status: 400 });
  }

  db.setPhone(session.userId, phone, smsEnabled === true);
  return NextResponse.json({ ok: true, smsEnabled: smsEnabled === true });
}

export async function DELETE(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  db.setPhone(session.userId, null, false);
  return NextResponse.json({ ok: true });
}
