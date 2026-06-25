export type AmazonSearchResult = {
  title: string;
  url: string;
  snippet: string;
  priceHint?: string;
};

type FirecrawlSearchResponse = {
  success?: boolean;
  data?: {
    web?: Array<{
      title?: string;
      url?: string;
      description?: string;
    }>;
  };
  error?: string;
};

export async function searchAmazonProducts(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<AmazonSearchResult[]> {
  const response = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: `${query} site:amazon.com`,
      limit: maxResults,
      includeDomains: ["amazon.com", "www.amazon.com"],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firecrawl search failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as FirecrawlSearchResponse;

  if (!data.success) {
    throw new Error(data.error ?? "Firecrawl search failed");
  }

  return (data.data?.web ?? []).map((result) => ({
    title: result.title ?? "Unknown product",
    url: result.url ?? "",
    snippet: result.description ?? "",
    priceHint: extractPriceHint(result.description ?? result.title ?? ""),
  }));
}

export function extractPriceHint(text: string): string | undefined {
  const match = text.match(/\$[\d,]+(?:\.\d{2})?/);
  return match?.[0];
}
