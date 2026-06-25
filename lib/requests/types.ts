export type MerchRequestRecord = {
  id: string;
  product_title: string;
  product_price: string | null;
  product_image_url: string | null;
  source_url: string;
  search_query: string | null;
  status: "pending" | "fulfilled" | "cancelled";
  created_at: string;
};

export type CreateMerchRequestInput = {
  productTitle: string;
  productPrice?: string;
  productImageUrl?: string;
  sourceUrl: string;
  searchQuery?: string;
};
