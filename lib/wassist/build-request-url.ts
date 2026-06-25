import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function buildRequestUrl(
  product: AmazonSearchResult,
  options?: { searchQuery?: string; phoneNumber?: string }
): string {
  const params = new URLSearchParams({
    title: product.title,
    url: product.url,
  });

  if (product.priceHint) params.set("price", product.priceHint);
  if (product.imageUrl) params.set("image", product.imageUrl);
  if (options?.searchQuery) params.set("q", options.searchQuery);
  if (options?.phoneNumber) params.set("phone", options.phoneNumber);

  return `${getAppBaseUrl()}/request?${params.toString()}`;
}

export function parseProductFromSearchParams(
  params: URLSearchParams
): AmazonSearchResult | null {
  const title = params.get("title");
  const url = params.get("url");
  if (!title || !url) return null;

  return {
    title,
    url,
    snippet: "",
    priceHint: params.get("price") ?? undefined,
    imageUrl: params.get("image") ?? undefined,
  };
}
