export type AmazonSearchResult = {
  title: string;
  url: string;
  snippet: string;
  priceHint?: string;
  imageUrl?: string;
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

type FirecrawlScrapeResponse = {
  success?: boolean;
  data?: {
    images?: string[];
    metadata?: {
      ogImage?: string;
      title?: string;
    };
  };
  error?: string;
};

const TOP_N = 3;
const SEARCH_CANDIDATES = 5;

export async function searchAmazonProducts(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<AmazonSearchResult[]> {
  const limit = Math.min(maxResults, TOP_N);

  const response = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: `${query} site:amazon.com`,
      limit: SEARCH_CANDIDATES,
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

  const candidates = (data.data?.web ?? [])
    .filter((result) => result.url)
    .slice(0, limit)
    .map((result) => ({
      title: sanitizeProductTitle(result.title ?? "Unknown product"),
      url: result.url ?? "",
      snippet: result.description ?? "",
      priceHint: extractPriceHint(result.description ?? result.title ?? ""),
    }));

  const withImages = await Promise.all(
    candidates.map(async (product) => ({
      ...product,
      imageUrl: await scrapeProductImage(product.url, apiKey),
    }))
  );

  return withImages;
}

export async function scrapeProductImage(
  url: string,
  apiKey: string
): Promise<string | undefined> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["images"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as FirecrawlScrapeResponse;
    if (!data.success || !data.data) {
      return undefined;
    }

    return pickProductImage(data.data.images, data.data.metadata?.ogImage);
  } catch {
    return undefined;
  }
}

export function pickProductImage(
  images?: string[],
  ogImage?: string
): string | undefined {
  const amazonImage = images?.find(
    (img) =>
      img.includes("media-amazon.com") || img.includes("ssl-images-amazon.com")
  );
  if (amazonImage) return amazonImage;

  if (ogImage && !ogImage.startsWith("data:")) return ogImage;

  const firstRemote = images?.find((img) => img.startsWith("http"));
  return firstRemote;
}

export function extractPriceHint(text: string): string | undefined {
  const match = text.match(/\$[\d,]+(?:\.\d{2})?/);
  return match?.[0];
}

export function sanitizeProductTitle(title: string): string {
  return title
    .replace(/^Amazon\.com:\s*/i, "")
    .replace(/\s*[|:–-]\s*Amazon\.com.*$/i, "")
    .replace(/\s*\|\s*Amazon.*$/i, "")
    .trim();
}
