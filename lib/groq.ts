import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export async function generateArticleSummary(
  title: string,
  description: string,
  content: string
): Promise<string> {
  try {
    if (!GROQ_API_KEY) return "";

    const prompt = [
      "You are an expert news analyst.",
      "Summarize the article in exactly 2 clear sentences.",
      "Do not use bullet points. Do not add a title.",
      "",
      `Title: ${title || ""}`,
      `Description: ${description || ""}`,
      `Content: ${content || ""}`,
    ].join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.2,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return summary;
  } catch {
    return "";
  }
}

