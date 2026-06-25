import { buildRequestUrl } from "@/lib/wassist/build-request-url";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type FormatProductReplyOptions = {
  searchQuery?: string;
  phoneNumber?: string;
};

export function formatProductReply(
  product: AmazonSearchResult,
  index: number,
  options?: FormatProductReplyOptions
): string {
  const option = index + 1;
  const price = product.priceHint ? ` — ${product.priceHint}` : "";
  const requestUrl = buildRequestUrl(product, {
    searchQuery: options?.searchQuery,
    phoneNumber: options?.phoneNumber,
  });

  return [
    `Option ${option}: ${product.title}${price}`,
    `Request this: ${requestUrl}`,
  ].join("\n");
}
