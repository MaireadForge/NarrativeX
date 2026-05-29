import stringSimilarity from "string-similarity";

import type { NewsAPIArticle } from "@/lib/newsapi";

export function deduplicateArticles(articles: NewsAPIArticle[]): NewsAPIArticle[] {
  const toRemove = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (toRemove.has(i)) continue;

    const a = articles[i];
    const aTitle = (a.title ?? "").trim();
    if (!aTitle) continue;

    for (let j = i + 1; j < articles.length; j++) {
      if (toRemove.has(j)) continue;

      const b = articles[j];
      const bTitle = (b.title ?? "").trim();
      if (!bTitle) continue;

      const score = stringSimilarity.compareTwoStrings(aTitle, bTitle);
      if (score <= 0.6) continue;

      const aDescLen = (a.description ?? "").trim().length;
      const bDescLen = (b.description ?? "").trim().length;

      if (bDescLen > aDescLen) {
        toRemove.add(i);
        break;
      } else {
        toRemove.add(j);
      }
    }
  }

  return articles.filter((_, idx) => !toRemove.has(idx));
}

