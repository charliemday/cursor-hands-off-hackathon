import { formatProductReply } from "@/lib/wassist/format-product-reply";
import type { WassistReplyBody } from "@/lib/wassist/types";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type SendProductRepliesOptions = {
  searchQuery?: string;
  phoneNumber?: string;
};

export type SendProductRepliesResult = {
  sent: number;
  errors: string[];
};

export async function sendProductReplies(
  replyCallback: string,
  products: AmazonSearchResult[],
  options?: SendProductRepliesOptions
): Promise<SendProductRepliesResult> {
  const errors: string[] = [];
  let sent = 0;

  for (const [index, product] of products.entries()) {
    const body: WassistReplyBody = {
      content: formatProductReply(product, index, {
        searchQuery: options?.searchQuery,
        phoneNumber: options?.phoneNumber,
      }),
    };

    if (product.imageUrl) {
      body.image = product.imageUrl;
    }

    try {
      const response = await fetch(replyCallback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        errors.push(
          `Option ${index + 1} reply_callback failed (${response.status}): ${await response.text()}`
        );
        continue;
      }

      sent += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown reply_callback error";
      errors.push(`Option ${index + 1} reply_callback failed: ${message}`);
    }
  }

  if (errors.length > 0) {
    console.error("Wassist reply_callback errors:", errors);
  }

  return { sent, errors };
}
