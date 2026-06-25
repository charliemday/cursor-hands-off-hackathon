import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

export function formatProductReply(
  product: AmazonSearchResult,
  index: number
): string {
  const option = index + 1;
  const price = product.priceHint ? ` — ${product.priceHint}` : "";
  return `Option ${option}: ${product.title}${price}`;
}
