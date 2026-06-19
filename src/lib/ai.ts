import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./retry";
import { DEFAULT_WRITER_MODEL, normalizeModel } from "./models";
import {
  extractGroundingItems,
  buildAuthoritativeArticles,
  reconcileHtmlLinks,
  type RawModelArticle,
} from "./source-urls";

const GEMINI_SEARCH_MODEL = "gemini-2.5-flash";

// Maps the user-selected digest length to how many articles to gather and how
// the newsletter should be structured. searchCount drives breadth (the more
// stories pulled, the more the writer has to work with); writeInstruction sets
// the target sections/paragraphs.
const LENGTH_GUIDE: Record<
  string,
  { searchCount: string; writeInstruction: string }
> = {
  brief: {
    searchCount: "4-6",
    writeInstruction:
      "Keep it very brief: a SINGLE focused section of 1 short paragraph covering only the most important story.",
  },
  short: {
    searchCount: "6-10",
    writeInstruction:
      "Keep it short: 1-2 thematic sections, roughly 2 paragraphs total.",
  },
  standard: {
    searchCount: "10-15",
    writeInstruction:
      "Standard length: 3-4 thematic sections, one substantial paragraph each.",
  },
  detailed: {
    searchCount: "15-20",
    writeInstruction:
      "Detailed: 5-6 thematic sections with 1-2 paragraphs each, spanning a broad range of stories across different industries and interests.",
  },
  comprehensive: {
    searchCount: "20-30",
    writeInstruction:
      "Comprehensive deep-dive: 7 or more thematic sections, multiple paragraphs each, covering the full breadth of available reporting across many different industries and interests.",
  },
};

function lengthGuide(length: string) {
  return LENGTH_GUIDE[length] || LENGTH_GUIDE.standard;
}

export interface NewsletterContent {
  title: string;
  summaryHtml: string;
  sources: { url: string; title: string; outlet: string; lean: string }[];
}

interface SearchArticle {
  title: string;
  url: string;
  source: string;
  description: string;
  lean: string;
  domain: string;
}

/**
 * Step 1: Use Gemini 2.0 Flash + Google Search to find current articles.
 */
async function searchForArticles(
  topicPrompt: string,
  categories: string[],
  geminiApiKey: string,
  length: string
): Promise<{ articles: SearchArticle[]; groundedText: string }> {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_SEARCH_MODEL,
    tools: [
      // @ts-expect-error — googleSearch tool exists but SDK types may not include it
      { googleSearch: {} },
    ],
  });

  const categoryHint = categories.length > 0
    ? `Categories: ${categories.join(", ")}.`
    : "";

  const prompt = `Search the web for the latest news about: ${topicPrompt}
${categoryHint}

Find ${lengthGuide(length).searchCount} recent news articles from reputable sources. For each article, provide:
- The exact article title
- The full URL
- The source/outlet name
- A 1-2 sentence description of what the article covers

Respond with ONLY a JSON array, no other text:
[
  {"title": "Article Title", "url": "https://...", "source": "Reuters", "description": "Brief description."},
  ...
]`;

  const result = await withRetry(() => model.generateContent(prompt), {
    onRetry: (err, attempt, delay) =>
      console.warn(
        `[ai] search model transient error — retry ${attempt} in ${Math.round(delay)}ms:`,
        err instanceof Error ? err.message : err
      ),
  });
  const responseText = result.response.text();

  // Parse the raw article list the model wrote. Its URLs are NOT trustworthy —
  // the model routinely fabricates plausible-looking paths that 404. We keep
  // these only for their titles/descriptions and reconcile URLs from grounding.
  const modelArticles = parseModelArticles(responseText);

  // Grounding metadata carries the real, resolvable redirect URLs.
  const grounding = extractGroundingItems((result.response as any));

  const articles = buildAuthoritativeArticles(modelArticles, grounding);

  // When the model answers with grounded prose instead of the JSON array we
  // asked for, that prose is the only place the specific events/facts live —
  // the grounding chunks alone are just domains. Keep it to write from.
  const groundedText = modelArticles.length === 0 ? responseText.trim() : "";

  console.log(
    `Google Search: ${modelArticles.length} model articles, ${grounding.length} grounded → ${articles.length} sources` +
      (groundedText ? ` (+${groundedText.length} chars grounded prose)` : "")
  );
  return { articles, groundedText };
}

function parseModelArticles(responseText: string): RawModelArticle[] {
  const toArticles = (arr: any): RawModelArticle[] =>
    Array.isArray(arr)
      ? arr
          .filter((a: any) => a && a.title && a.url && a.source)
          .map((a: any) => ({
            title: String(a.title),
            url: String(a.url),
            source: String(a.source),
            description: a.description ? String(a.description) : "",
          }))
      : [];

  try {
    const cleaned = responseText.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    return toArticles(JSON.parse(cleaned));
  } catch {
    const match = responseText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return toArticles(JSON.parse(match[0]));
      } catch { /* give up on parsing */ }
    }
  }
  return [];
}

/**
 * Step 2: Use Gemma 4 to write the newsletter from the found articles.
 */
async function writeNewsletter(
  articles: SearchArticle[],
  groundedText: string,
  topicPrompt: string,
  perspective: string,
  length: string,
  geminiApiKey: string,
  writerModel: string
): Promise<{ title: string; html: string }> {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: writerModel });

  // Give the writer more raw stories to work with for longer digests.
  const articleCap = length === "comprehensive" ? 30 : length === "detailed" ? 20 : 15;
  const articlesContext = articles
    .slice(0, articleCap)
    .map(
      (a, i) =>
        `[${i + 1}] "${a.title}" — ${a.source} (${a.lean})\n    URL: ${a.url}\n    ${a.description}`
    )
    .join("\n\n");

  // The structured list carries good headlines/summaries only when the model
  // returned JSON. When it returned grounded prose, that prose holds the
  // specific events — give it to the writer as the primary reporting so the
  // newsletter cites real happenings instead of vague themes around bare domains.
  const reportingBlock = groundedText
    ? `GROUNDED REPORTING (base the newsletter on the SPECIFIC events, names, numbers and facts in this — do not write generic themes):
${groundedText.slice(0, 12000)}

`
    : "";

  const perspectiveInstruction =
    perspective === "balanced"
      ? "Present all perspectives fairly, drawing from sources across the political spectrum."
      : `Lean toward a ${perspective} editorial perspective in your analysis and framing, while still being factual.`;

  const prompt = `You are an expert news digest editor. Write a newsletter from this material.

DO NOT include reasoning, planning, or thinking. Output ONLY the newsletter.

TOPIC: ${topicPrompt}
PERSPECTIVE: ${perspectiveInstruction}

${reportingBlock}SOURCES (use these for citation links — match each claim to the most relevant source):
${articlesContext}

Write the newsletter following these rules:
- Lead with concrete specifics: actual events, organizations, people, places and figures — never vague generalities
- LENGTH: ${lengthGuide(length).writeInstruction}
- Use <h2> for section headings, <p> for paragraphs
- Every claim MUST cite its source inline: <a href="URL">Source Name</a>, using a URL from the SOURCES list above
- Link text = source name only (e.g. "Reuters") — never show raw URLs
- End with a Source Transparency section listing each source and its editorial lean
- Professional, engaging tone

Output format — EXACTLY this, nothing else:

TITLE: Your Newsletter Title
---CONTENT---
<h2>Section</h2>
<p>Text with <a href="url">Source</a> citations.</p>`;

  const result = await withRetry(() => model.generateContent(prompt), {
    onRetry: (err, attempt, delay) =>
      console.warn(
        `[ai] Gemma writer transient error — retry ${attempt} in ${Math.round(delay)}ms:`,
        err instanceof Error ? err.message : err
      ),
  });

  // Extract non-thinking text
  let responseText = "";
  try {
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if ((part as any).thought) continue;
      if (part.text) responseText += part.text;
    }
  } catch { /* fallback */ }
  if (!responseText) responseText = result.response.text();

  let title = "Your Daily News Digest";
  let html = "";

  // Strategy 1: TITLE/---CONTENT--- delimiter
  const contentSep = responseText.indexOf("---CONTENT---");
  if (contentSep !== -1) {
    const headerPart = responseText.slice(0, contentSep);
    html = responseText.slice(contentSep + "---CONTENT---".length).trim();
    const titleMatches = [...headerPart.matchAll(/TITLE:\s*(.+)/gi)];
    if (titleMatches.length > 0) {
      title = titleMatches[titleMatches.length - 1][1].trim();
    }
  }

  // Strategy 2: Find first <h2> tag
  if (!html || html.length < 50) {
    const h2Index = responseText.indexOf("<h2");
    if (h2Index !== -1) {
      html = responseText.slice(h2Index).trim();
      const beforeH2 = responseText.slice(Math.max(0, h2Index - 500), h2Index);
      const titleMatch = beforeH2.match(/TITLE:\s*(.+)/i);
      if (titleMatch) title = titleMatch[1].trim();
    }
  }

  // Strategy 3: Last resort
  if (!html || html.length < 50) {
    const firstTag = responseText.indexOf("<");
    if (firstTag >= 0) html = responseText.slice(firstTag);
    else html = `<p>${responseText}</p>`;
  }

  return { title, html };
}

/**
 * Main entry point: Google Search → Gemma 4 newsletter.
 * Always uses Google Search for articles. Always uses Gemma 4 for writing.
 */
export async function searchAndGenerateNewsletter(
  topicPrompt: string,
  perspective: string,
  categories: string[],
  geminiApiKey: string,
  length: string = "standard",
  writerModel: string = DEFAULT_WRITER_MODEL
): Promise<NewsletterContent> {
  // Step 1: Find articles with Google Search (via Gemini 2.0 Flash)
  const { articles, groundedText } = await searchForArticles(
    topicPrompt,
    categories,
    geminiApiKey,
    length
  );

  if (articles.length === 0) {
    throw new Error("Google Search returned no articles. Try a different topic prompt.");
  }

  // Step 2: Write newsletter with Gemma 4
  const { title, html } = await writeNewsletter(
    articles,
    groundedText,
    topicPrompt,
    perspective,
    length,
    geminiApiKey,
    normalizeModel(writerModel)
  );

  // Post-process: convert stray markdown links to HTML
  let cleanHtml = html
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');

  // Repoint every body link at a known-good URL (and strip links we can't trust),
  // so citations in the prose can't 404 even if the model invented an href.
  cleanHtml = reconcileHtmlLinks(cleanHtml, articles);

  // Truncate bare URLs appearing as visible text
  cleanHtml = cleanHtml.replace(
    />(\s*)(https?:\/\/[^\s<]{50,})(\s*)</g,
    ">$1[link]$3<"
  );

  const sources = articles.map((a) => ({
    url: a.url,
    title: a.title,
    outlet: a.source,
    lean: a.lean,
  }));

  return { title, summaryHtml: cleanHtml, sources };
}
