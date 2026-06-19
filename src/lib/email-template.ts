import { htmlToText } from "./html";

export interface ComposedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Wrap a newsletter's body HTML fragment (<h2>/<p>/<a> …) in a responsive
 * email shell. Returns subject + HTML + plain-text fallback.
 */
export function buildNewsletterEmail(title: string, summaryHtml: string): ComposedEmail {
  const safeTitle = escapeHtml(title);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    htmlToText(summaryHtml).slice(0, 120)
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e8ec;">
          <tr>
            <td style="background:#0f1b2d;padding:20px 28px;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">Aurelia</span>
              <span style="font-family:Arial,sans-serif;font-size:11px;color:#9fb0c3;letter-spacing:0.08em;text-transform:uppercase;float:right;padding-top:5px;">News Digest</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:#0f1b2d;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#26303d;">
              ${summaryHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#f7f8fa;border-top:1px solid #e6e8ec;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#8a96a3;">
              You're receiving this because email delivery is on for your Aurelia account.
              Turn it off anytime from your dashboard.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${title}\n\n${htmlToText(summaryHtml)}\n\n—\nAurelia News Digest. Turn off email delivery from your dashboard.`;

  return { subject: title, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
