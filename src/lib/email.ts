// Resend email sender — zero-dependency wrapper over Resend's REST API.
// Credentials come from env (RESEND_API_KEY / EMAIL_FROM). If RESEND_API_KEY is
// missing, sending is skipped so the app still runs without Resend configured.

// Resend's onboarding sender works immediately but only delivers to your own
// Resend signup address; sending to arbitrary users requires a verified domain.
const DEFAULT_FROM = "Aurelia <onboarding@resend.dev>";

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  id?: string;
}

/**
 * Send an email via Resend. Never throws — returns a result object so callers
 * (e.g. newsletter generation) can log failures without failing the request.
 */
export async function sendNewsletterEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email send");
    return { ok: false, skipped: true, error: "Resend not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || data?.error?.message || `Resend responded ${res.status}`;
      console.error("[email] send failed:", msg);
      return { ok: false, error: msg };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[email] send error:", msg);
    return { ok: false, error: msg };
  }
}
