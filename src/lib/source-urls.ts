import { getLeanFromDomain, leanLabel } from "./sources";

// The Gemini search model frequently hallucinates article URLs in its free-text
// JSON output (correct domain, fabricated path → 404). The grounding metadata it
// returns alongside contains real, resolvable redirect URLs. These helpers make
// the grounding URLs authoritative and reconcile the written HTML against them.

export interface SourceArticle {
  title: string;
  url: string;
  source: string;
  description: string;
  lean: string;
  domain: string;
}

export interface RawModelArticle {
  title: string;
  url: string;
  source: string;
  description: string;
}

export interface GroundingItem {
  uri: string;
  domain: string; // best-effort real source domain (NOT the redirect host)
  title: string;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

// The grounding chunk's web.title is usually the real source domain (e.g.
// "reuters.com") or name. web.uri is a Google redirect host, so it can't give us
// the source domain — we read it from the title when it looks domain-shaped.
export function extractGroundingItems(response: any): GroundingItem[] {
  const chunks =
    response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const items: GroundingItem[] = [];
  for (const c of chunks) {
    const uri: string | undefined = c?.web?.uri;
    if (!uri) continue;
    const title: string = c?.web?.title || "";
    const looksLikeDomain = /\./.test(title) && !/\s/.test(title);
    const domain = looksLikeDomain ? title.replace(/^www\./, "").toLowerCase() : "";
    items.push({ uri, domain, title });
  }
  return items;
}

// Build the trusted article list. When grounding exists, every article URL is a
// grounding redirect URL (resolvable). We borrow title/description from the
// matching model article (by source domain) for nicer copy, but never its URL.
export function buildAuthoritativeArticles(
  model: RawModelArticle[],
  grounding: GroundingItem[]
): SourceArticle[] {
  if (grounding.length === 0) {
    return model.map((m) => {
      const domain = hostOf(m.url);
      return {
        title: m.title,
        url: m.url,
        source: m.source,
        description: m.description || "",
        lean: leanLabel(getLeanFromDomain(domain)),
        domain,
      };
    });
  }

  const used = new Set<number>();
  const out: SourceArticle[] = [];
  for (const g of grounding) {
    let matchIdx = -1;
    if (g.domain) {
      matchIdx = model.findIndex((m, i) => !used.has(i) && hostOf(m.url) === g.domain);
    }

    let title = g.title || g.domain;
    let source = g.domain || g.title;
    let description = "";
    let leanDomain = g.domain;

    if (matchIdx >= 0) {
      used.add(matchIdx);
      const m = model[matchIdx];
      if (m.title) title = m.title;
      if (m.source) source = m.source;
      description = m.description || "";
      if (!leanDomain) leanDomain = hostOf(m.url);
    }

    out.push({
      title,
      url: g.uri,
      source,
      description,
      lean: leanLabel(getLeanFromDomain(leanDomain)),
      domain: leanDomain,
    });
  }
  return out;
}

// Rewrite every <a href> in the model-written HTML to point at a known-good URL.
// Match priority: exact URL already trusted → href domain → visible link text
// (outlet name). Links we can't map are unwrapped to plain text so they can't 404.
export function reconcileHtmlLinks(
  html: string,
  articles: { url: string; source: string; domain: string }[]
): string {
  const known = new Set(articles.map((a) => a.url));
  const byDomain = new Map<string, string>();
  const byOutlet = new Map<string, string>();
  for (const a of articles) {
    const d = a.domain || hostOf(a.url);
    if (d && !byDomain.has(d)) byDomain.set(d, a.url);
    const o = (a.source || "").trim().toLowerCase();
    if (o && !byOutlet.has(o)) byOutlet.set(o, a.url);
  }

  return html.replace(
    /<a\b[^>]*?href\s*=\s*("|')(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, _q, href, inner) => {
      if (known.has(href)) return `<a href="${href}">${inner}</a>`;

      const hd = hostOf(href);
      if (hd && byDomain.has(hd)) return `<a href="${byDomain.get(hd)}">${inner}</a>`;

      const label = inner.replace(/<[^>]+>/g, "").trim().toLowerCase();
      if (label && byOutlet.has(label)) return `<a href="${byOutlet.get(label)}">${inner}</a>`;
      if (label.length > 2) {
        for (const [o, u] of byOutlet) {
          if (o.length > 2 && (label.includes(o) || o.includes(label))) {
            return `<a href="${u}">${inner}</a>`;
          }
        }
      }

      // No trustworthy URL — strip the link, keep the text.
      return inner;
    }
  );
}
