import { db } from "./db";
import type { Article } from "./news";

export function deduplicateArticles(
  articles: Article[],
  automationId: string
): Article[] {
  const previousHashes = new Set(db.getRecentArticleHashes(automationId));

  return articles.filter((a) => !previousHashes.has(a.urlHash));
}
