import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { CreateMerchRequestInput, MerchRequestRecord } from "@/lib/requests/types";

export async function createMerchRequest(
  input: CreateMerchRequestInput
): Promise<MerchRequestRecord> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase
    .from("merch_requests")
    .insert({
      product_title: input.productTitle,
      product_price: input.productPrice ?? null,
      product_image_url: input.productImageUrl ?? null,
      source_url: input.sourceUrl,
      search_query: input.searchQuery ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MerchRequestRecord;
}

export { isSupabaseConfigured };
