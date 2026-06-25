import { formatProductReply } from "@/lib/wassist/format-product-reply";
import type { WassistReplyBody } from "@/lib/wassist/types";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

export async function sendProductReplies(
  replyCallback: string,
  products: AmazonSearchResult[]
): Promise<void> {
  for (const [index, product] of products.entries()) {
    const body: WassistReplyBody = {
      content: formatProductReply(product, index),
    };

    if (product.imageUrl) {
      body.image = product.imageUrl;
    }

    const response = await fetch(replyCallback, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Wassist reply_callback failed (${response.status}): ${await response.text()}`
      );
    }
  }
}
