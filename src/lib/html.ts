// Shared HTML helpers used by both SMS and email delivery.

/** Strip HTML to readable plain text suitable for an SMS body or email text part. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*(br|\/p|\/h[1-6]|\/li|\/div)\s*>/gi, "\n") // block ends → newline
    .replace(/<li[^>]*>/gi, "• ") // list items → bullets
    .replace(/<[^>]+>/g, "") // remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n") // collapse blank runs
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
