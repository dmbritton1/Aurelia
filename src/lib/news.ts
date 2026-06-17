import { getLeanFromDomain, type PoliticalLean } from "./sources";
import crypto from "crypto";

const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
const NEWS_API_BASE = "https://newsapi.org/v2";

export interface Article {
  title: string;
  description: string;
  url: string;
  urlHash: string;
  source: string;
  sourceId: string;
  sourceLean: PoliticalLean;
  publishedAt: string;
  content: string | null;
  imageUrl: string | null;
}

const CATEGORY_TO_NEWSAPI: Record<string, string> = {
  "Politics": "general",
  "Tech": "technology",
  "Business": "business",
  "Science": "science",
  "Health": "health",
  "Sports": "sports",
  "Entertainment": "entertainment",
  "Culture": "entertainment",
};

function buildArticle(a: {
  title?: string;
  description?: string;
  url?: string;
  source?: { name?: string; id?: string };
  publishedAt?: string;
  content?: string;
  urlToImage?: string;
}, seenUrls: Set<string>): Article | null {
  if (!a.url || seenUrls.has(a.url)) return null;
  if (a.title === "[Removed]" || !a.title) return null;
  seenUrls.add(a.url);

  let domain = "";
  try { domain = new URL(a.url).hostname; } catch { /* skip */ }

  return {
    title: a.title || "",
    description: a.description || "",
    url: a.url,
    urlHash: crypto.createHash("sha256").update(a.url).digest("hex").slice(0, 16),
    source: a.source?.name || domain,
    sourceId: a.source?.id || "",
    sourceLean: getLeanFromDomain(domain),
    publishedAt: a.publishedAt || "",
    content: a.content || null,
    imageUrl: a.urlToImage || null,
  };
}

async function fetchFromNewsAPI(
  topicPrompt: string,
  categories: string[],
  maxResults: number
): Promise<Article[]> {
  const articles: Article[] = [];
  const seenUrls = new Set<string>();

  const keywordQuery = topicPrompt.slice(0, 500);
  const everythingUrl = `${NEWS_API_BASE}/everything?` +
    new URLSearchParams({
      q: keywordQuery,
      sortBy: "publishedAt",
      language: "en",
      pageSize: String(Math.min(maxResults, 100)),
      apiKey: NEWS_API_KEY,
    });

  const resp = await fetch(everythingUrl);
  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`NewsAPI /everything returned ${resp.status}: ${errBody}`);
    throw new Error(`NewsAPI error: ${resp.status}`);
  }

  const data = await resp.json();
  for (const a of data.articles || []) {
    const article = buildArticle(a, seenUrls);
    if (article) articles.push(article);
  }

  if (categories.length > 0 && articles.length < maxResults) {
    const newsapiCategories = [...new Set(
      categories.map(c => CATEGORY_TO_NEWSAPI[c]).filter(Boolean)
    )];

    for (const cat of newsapiCategories.slice(0, 2)) {
      const headlinesUrl = `${NEWS_API_BASE}/top-headlines?` +
        new URLSearchParams({
          category: cat,
          language: "en",
          pageSize: "10",
          apiKey: NEWS_API_KEY,
        });

      try {
        const hResp = await fetch(headlinesUrl);
        if (hResp.ok) {
          const hData = await hResp.json();
          for (const a of hData.articles || []) {
            const article = buildArticle(a, seenUrls);
            if (article) articles.push(article);
          }
        }
      } catch (e) {
        console.error(`NewsAPI headlines (${cat}) failed:`, e);
      }
    }
  }

  return articles.slice(0, maxResults);
}

async function fetchFromGNews(
  topicPrompt: string,
  maxResults: number
): Promise<Article[]> {
  const articles: Article[] = [];
  const seenUrls = new Set<string>();

  const keywords = topicPrompt
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .slice(0, 8)
    .join(" ");

  const url = `https://gnews.io/api/v4/search?` +
    new URLSearchParams({
      q: keywords,
      lang: "en",
      max: String(Math.min(maxResults, 10)),
      apikey: process.env.GNEWS_API_KEY || "",
    });

  try {
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      for (const a of data.articles || []) {
        const article = buildArticle(
          { ...a, source: { name: a.source?.name }, urlToImage: a.image },
          seenUrls
        );
        if (article) articles.push(article);
      }
      if (articles.length > 0) return articles;
    }
  } catch (e) {
    console.error("GNews fetch failed:", e);
  }

  return articles;
}

function extractSearchKeywords(topicPrompt: string): string {
  // Remove task/instruction words and keep meaningful topic keywords
  const stopWords = new Set([
    // Articles, conjunctions, prepositions
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need",
    "about", "above", "after", "before", "between", "into", "through",
    "during", "out", "over", "under", "again", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "each", "every",
    "both", "few", "more", "most", "other", "some", "such", "no", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "because",
    "as", "until", "while", "that", "this", "these", "those",
    "me", "my", "we", "our", "you", "your", "it", "its", "they", "them", "their",
    "what", "which", "who", "whom", "up", "also", "like",
    // Task/instruction words the user might use in prompts
    "write", "create", "make", "give", "find", "show", "tell", "get",
    "want", "need", "keep", "let", "know", "think", "look", "looking",
    "digest", "newsletter", "summary", "report", "update", "updates",
    "latest", "recent", "new", "news", "daily", "weekly",
    "emphasize", "focus", "interested", "care", "related", "regarding",
    "describe", "discuss", "cover", "covering", "include", "including",
  ]);

  const seen = new Set<string>();
  const words = topicPrompt
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => {
      if (w.length <= 1 || stopWords.has(w) || seen.has(w)) return false;
      seen.add(w);
      return true;
    });

  // Take up to 6 meaningful unique keywords
  return words.slice(0, 6).join(" ");
}

async function fetchRSSFeed(query: string): Promise<Article[]> {
  const articles: Article[] = [];
  const seenUrls = new Set<string>();
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const resp = await fetch(feedUrl, {
      headers: { "User-Agent": "NewsFlow/1.0" },
    });
    if (!resp.ok) return articles;

    const xml = await resp.text();

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() || "";
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
      const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() || "";
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim() || "";

      if (!link || !title || seenUrls.has(link)) continue;
      seenUrls.add(link);

      let domain = "";
      try { domain = new URL(link).hostname; } catch { /* skip */ }

      articles.push({
        title,
        description: description.slice(0, 300),
        url: link,
        urlHash: crypto.createHash("sha256").update(link).digest("hex").slice(0, 16),
        source: sourceName || domain,
        sourceId: "",
        sourceLean: getLeanFromDomain(domain),
        publishedAt: pubDate,
        content: description,
        imageUrl: null,
      });

      if (articles.length >= 20) break;
    }
  } catch (e) {
    console.error("RSS fetch failed:", e);
  }

  return articles;
}

async function fetchFromRSS(topicPrompt: string): Promise<Article[]> {
  const keywords = extractSearchKeywords(topicPrompt);
  console.log("RSS search keywords:", keywords);

  // Try progressively wider date ranges
  for (const dateFilter of ["when:1d", "when:7d", ""]) {
    const query = dateFilter ? `${keywords} ${dateFilter}` : keywords;
    console.log("Trying RSS query:", query);
    const articles = await fetchRSSFeed(query);
    if (articles.length > 0) {
      console.log(`Found ${articles.length} articles with filter: ${dateFilter || "none"}`);
      return articles;
    }
  }

  return [];
}

function sortByRecent(articles: Article[]): Article[] {
  return articles.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}

export async function fetchArticles(
  topicPrompt: string,
  categories: string[],
  maxResults: number = 30
): Promise<Article[]> {
  if (NEWS_API_KEY && NEWS_API_KEY !== "your_newsapi_key_here") {
    try {
      const articles = await fetchFromNewsAPI(topicPrompt, categories, maxResults);
      if (articles.length > 0) return articles;
    } catch (e) {
      console.error("NewsAPI failed, trying fallbacks:", e);
    }
  }

  if (process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY !== "your_gnews_key_here") {
    const articles = await fetchFromGNews(topicPrompt, maxResults);
    if (articles.length > 0) return articles;
  }

  console.log("Using Google News RSS fallback");
  return sortByRecent(await fetchFromRSS(topicPrompt));
}
