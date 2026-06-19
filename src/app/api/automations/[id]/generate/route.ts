import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchAndGenerateNewsletter } from "@/lib/ai";
import { sendSms, buildNewsletterSms } from "@/lib/sms";
import { sendNewsletterEmail } from "@/lib/email";
import { buildNewsletterEmail } from "@/lib/email-template";
import { isTransientError } from "@/lib/retry";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const automation = db.getAutomation(id, session.userId);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // Get user's Gemini API key
    const geminiKey = db.getGeminiApiKey(session.userId);
    if (!geminiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Go to your Dashboard and add your API key to get started." },
        { status: 400 }
      );
    }

    // Google Search (Gemini 2.0 Flash) → Gemma 4 newsletter pipeline
    const newsletter = await searchAndGenerateNewsletter(
      automation.topic_prompt as string,
      automation.perspective as string,
      automation.categories as string[],
      geminiKey,
      (automation.length as string) || "standard",
      automation.model as string
    );

    const saved = db.createNewsletter(id, {
      title: newsletter.title,
      summary_html: newsletter.summaryHtml,
      sources: newsletter.sources,
      article_hashes: newsletter.sources.map((s) => {
        const crypto = require("crypto");
        return crypto.createHash("sha256").update(s.url).digest("hex").slice(0, 16);
      }),
    });

    // Auto-send to the user's phone if they opted in. An SMS failure must never
    // fail generation — log it and still return the newsletter.
    let sms: { sent: boolean; error?: string } | undefined;
    const { phone, sms_enabled } = db.getPhone(session.userId);
    if (phone && sms_enabled) {
      const result = await sendSms(phone, buildNewsletterSms(saved.title, saved.summary_html));
      if (result.ok) {
        sms = { sent: true };
      } else {
        console.error("Newsletter SMS delivery failed:", result.error);
        sms = { sent: false, error: result.error };
      }
    }

    // Auto-send to the user's email if they opted in. Like SMS, a failure here
    // must never fail generation — log it and still return the newsletter.
    let email: { sent: boolean; error?: string } | undefined;
    const { effectiveEmail: address, email_enabled } = db.getEmailPrefs(session.userId);
    if (address && email_enabled) {
      const composed = buildNewsletterEmail(saved.title, saved.summary_html);
      const result = await sendNewsletterEmail(address, composed.subject, composed.html, composed.text);
      if (result.ok) {
        email = { sent: true };
      } else {
        console.error("Newsletter email delivery failed:", result.error);
        email = { sent: false, error: result.error };
      }
    }

    return NextResponse.json({ newsletter: saved, sms, email }, { status: 201 });
  } catch (e) {
    console.error("Newsletter generation failed:", e);

    // Transient upstream overload survived our retries — tell the user to retry
    // rather than surfacing a raw "[500 Internal error]" SDK message.
    if (isTransientError(e)) {
      return NextResponse.json(
        { error: "The AI model is temporarily overloaded. Please try again in a moment." },
        { status: 503 }
      );
    }

    let message = "Generation failed";
    if (e instanceof Error) {
      if (e.message.includes("API_KEY_INVALID") || e.message.includes("API key not valid")) {
        message = "Invalid Gemini API key. Please update your key on the Dashboard.";
      } else {
        message = e.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
