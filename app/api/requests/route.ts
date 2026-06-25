import { createMerchRequest, isSupabaseConfigured } from "@/lib/requests/create-request";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type RequestBody = {
  product: AmazonSearchResult;
  searchQuery?: string;
};

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      {
        error:
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { product, searchQuery } = body;

  if (!product?.title || !product?.url) {
    return Response.json({ error: "product title and url are required" }, { status: 400 });
  }

  try {
    const record = await createMerchRequest({
      productTitle: product.title,
      productPrice: product.priceHint,
      productImageUrl: product.imageUrl,
      sourceUrl: product.url,
      searchQuery,
    });

    return Response.json({
      id: record.id,
      status: record.status,
      createdAt: record.created_at,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save request";
    return Response.json({ error: message }, { status: 500 });
  }
}
