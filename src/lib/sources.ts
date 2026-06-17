export type PoliticalLean = "left" | "center-left" | "center" | "center-right" | "right";

export const SOURCE_LEAN_MAP: Record<string, PoliticalLean> = {
  "the-huffington-post": "left",
  "msnbc": "left",
  "the-guardian-uk": "center-left",
  "the-guardian-us": "center-left",
  "cnn": "center-left",
  "nbc-news": "center-left",
  "abc-news": "center-left",
  "cbs-news": "center-left",
  "bbc-news": "center",
  "reuters": "center",
  "associated-press": "center",
  "bloomberg": "center",
  "the-wall-street-journal": "center-right",
  "the-hill": "center",
  "usa-today": "center",
  "politico": "center",
  "axios": "center",
  "the-washington-post": "center-left",
  "the-new-york-times": "center-left",
  "npr": "center-left",
  "pbs": "center-left",
  "time": "center-left",
  "newsweek": "center",
  "fox-news": "right",
  "the-washington-times": "center-right",
  "national-review": "right",
  "breitbart-news": "right",
  "the-american-conservative": "right",
  "new-york-magazine": "center-left",
  "vice-news": "left",
  "vox": "left",
  "al-jazeera-english": "center",
  "the-economist": "center",
  "financial-times": "center",
  "techcrunch": "center",
  "the-verge": "center-left",
  "wired": "center-left",
  "ars-technica": "center",
  "engadget": "center",
  "business-insider": "center",
  "fortune": "center",
  "cnbc": "center",
  "the-telegraph": "center-right",
  "the-independent": "center-left",
  "daily-mail": "center-right",
  "the-times-of-india": "center",
  "espn": "center",
  "bbc-sport": "center",
};

export function getSourceLean(sourceId: string): PoliticalLean {
  return SOURCE_LEAN_MAP[sourceId] || "center";
}

export function getLeanFromDomain(domain: string): PoliticalLean {
  const domainMap: Record<string, PoliticalLean> = {
    "huffpost.com": "left",
    "msnbc.com": "left",
    "theguardian.com": "center-left",
    "cnn.com": "center-left",
    "nbcnews.com": "center-left",
    "abcnews.go.com": "center-left",
    "cbsnews.com": "center-left",
    "bbc.com": "center",
    "bbc.co.uk": "center",
    "reuters.com": "center",
    "apnews.com": "center",
    "bloomberg.com": "center",
    "wsj.com": "center-right",
    "thehill.com": "center",
    "usatoday.com": "center",
    "politico.com": "center",
    "axios.com": "center",
    "washingtonpost.com": "center-left",
    "nytimes.com": "center-left",
    "npr.org": "center-left",
    "pbs.org": "center-left",
    "time.com": "center-left",
    "newsweek.com": "center",
    "foxnews.com": "right",
    "washingtontimes.com": "center-right",
    "nationalreview.com": "right",
    "breitbart.com": "right",
    "vice.com": "left",
    "vox.com": "left",
    "aljazeera.com": "center",
    "economist.com": "center",
    "ft.com": "center",
    "techcrunch.com": "center",
    "theverge.com": "center-left",
    "wired.com": "center-left",
    "arstechnica.com": "center",
    "businessinsider.com": "center",
    "fortune.com": "center",
    "cnbc.com": "center",
    "telegraph.co.uk": "center-right",
    "independent.co.uk": "center-left",
    "dailymail.co.uk": "center-right",
    "espn.com": "center",
  };
  for (const [d, lean] of Object.entries(domainMap)) {
    if (domain.includes(d)) return lean;
  }
  return "center";
}

const LEAN_ORDER: PoliticalLean[] = ["left", "center-left", "center", "center-right", "right"];

export function leanDistance(a: PoliticalLean, b: PoliticalLean): number {
  return Math.abs(LEAN_ORDER.indexOf(a) - LEAN_ORDER.indexOf(b));
}

export function filterByPerspective(
  articles: { url: string; source: string; sourceLean: PoliticalLean }[],
  perspective: string
): typeof articles {
  if (perspective === "balanced") return articles;

  const target = perspective as PoliticalLean;
  return articles
    .sort((a, b) => leanDistance(a.sourceLean, target) - leanDistance(b.sourceLean, target))
    .slice(0, Math.max(Math.ceil(articles.length * 0.7), 5));
}

export function leanLabel(lean: PoliticalLean): string {
  const labels: Record<PoliticalLean, string> = {
    "left": "Left",
    "center-left": "Center-Left",
    "center": "Center",
    "center-right": "Center-Right",
    "right": "Right",
  };
  return labels[lean];
}

export function leanColor(lean: PoliticalLean): string {
  const colors: Record<PoliticalLean, string> = {
    "left": "#3b82f6",
    "center-left": "#60a5fa",
    "center": "#a855f7",
    "center-right": "#f87171",
    "right": "#ef4444",
  };
  return colors[lean];
}
