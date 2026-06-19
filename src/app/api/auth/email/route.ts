import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

// Basic email format check (intentionally permissive).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loginEmail, deliveryEmail, effectiveEmail, email_enabled } = db.getEmailPrefs(session.userId);
  return NextResponse.json({
    loginEmail,
    deliveryEmail,
    effectiveEmail,
    emailEnabled: email_enabled,
  });
}

export async function PATCH(req: NextRequest) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Update the delivery-email override when present. Empty string clears it
  // (reverts to login email); a non-empty value must be a valid address.
  if (body.deliveryEmail !== undefined) {
    const raw = typeof body.deliveryEmail === "string" ? body.deliveryEmail.trim() : "";
    if (raw === "") {
      db.setDeliveryEmail(session.userId, null);
    } else if (EMAIL_RE.test(raw)) {
      db.setDeliveryEmail(session.userId, raw);
    } else {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
  }

  if (body.emailEnabled !== undefined) {
    db.setEmailEnabled(session.userId, body.emailEnabled === true);
  }

  const { loginEmail, deliveryEmail, effectiveEmail, email_enabled } = db.getEmailPrefs(session.userId);
  return NextResponse.json({
    ok: true,
    loginEmail,
    deliveryEmail,
    effectiveEmail,
    emailEnabled: email_enabled,
  });
}
