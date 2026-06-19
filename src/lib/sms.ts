// Twilio SMS sender — zero-dependency wrapper over Twilio's REST API.
// Credentials come from env (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
// TWILIO_FROM_NUMBER). If any are missing, sending is skipped so the app
// still runs without Twilio configured.

import { htmlToText } from "./html";

// Twilio rejects single messages longer than 1600 chars, and every ~153-char
// GSM segment is billed separately. We cap well under the hard limit.
const MAX_SMS_CHARS = 1200;

/** Truncate at a word boundary, appending a marker when text is cut. */
export function truncateForSms(text: string, max: number = MAX_SMS_CHARS): string {
  if (text.length <= max) return text;
  const marker = "\n…(truncated)";
  const slice = text.slice(0, max - marker.length);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + marker;
}

/** Build the SMS body for a newsletter: title + plain-text body, capped. */
export function buildNewsletterSms(title: string, summaryHtml: string): string {
  const body = htmlToText(summaryHtml);
  return truncateForSms(`📰 ${title}\n\n${body}`);
}

export interface SmsResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  sid?: string;
}

/**
 * Send an SMS via Twilio. Never throws — returns a result object so callers
 * (e.g. newsletter generation) can log failures without failing the request.
 */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn("[sms] Twilio env not configured — skipping SMS send");
    return { ok: false, skipped: true, error: "Twilio not configured" };
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || `Twilio responded ${res.status}`;
      console.error("[sms] send failed:", msg);
      return { ok: false, error: msg };
    }
    return { ok: true, sid: data?.sid };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[sms] send error:", msg);
    return { ok: false, error: msg };
  }
}
