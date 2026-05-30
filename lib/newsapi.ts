const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export const SUPPORTED_COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "in", name: "India" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "jp", name: "Japan" },
] as const;

export type NewsAPIArticle = {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
};

type NewsAPIResponse = {
  status: "ok" | "error";
  articles?: NewsAPIArticle[];
};

export async function fetchNewsByCategory(
  category: string,
  country: string = "us"
): Promise<NewsAPIArticle[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return [];

    const url = new URL(`${NEWS_API_BASE_URL}/top-headlines`);
    url.searchParams.set("category", category);
    url.searchParams.set("country", country);
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("apiKey", apiKey);

    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) return [];

    const data = (await res.json().catch(() => null)) as NewsAPIResponse | null;
    return data?.articles ?? [];
  } catch {
    return [];
  }
}
