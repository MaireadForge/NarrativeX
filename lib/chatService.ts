import { searchArticles, type Article } from "@/lib/articleSearch";
import { groq } from "@/lib/groq";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function buildSystemPrompt(articles: Article[]): string {
  const header = [
    "You are NarrativeX, an AI news assistant. Answer questions based on the news articles provided below. If the answer cannot be found in the articles, say so honestly. Do not make up information.",
    "",
    "Current news articles:",
  ].join("\n");

  if (articles.length === 0) {
    return `${header}\n\nNo articles were found for this query.`;
  }

  const articleBlocks = articles.map((article, index) => {
    const summary = article.aiSummary || article.description || "No summary available.";
    const sourceName = article.source.name || "Unknown source";

    return [
      `[Article ${index + 1}]`,
      `Title: ${article.title}`,
      `Summary: ${summary}`,
      `Source: ${sourceName}`,
      `URL: ${article.url}`,
    ].join("\n");
  });

  return [header, ...articleBlocks].join("\n\n");
}

export async function chatWithNews(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<{ reply: string; sourcesUsed: Article[] }> {
  const articles = await searchArticles(userMessage, 5);
  const systemPrompt = buildSystemPrompt(articles);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      reply: reply || "I couldn't generate a response. Please try again.",
      sourcesUsed: articles,
    };
  } catch {
    return {
      reply: "Sorry, something went wrong while generating a response. Please try again.",
      sourcesUsed: articles,
    };
  }
}
