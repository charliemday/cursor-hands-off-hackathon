"use client";

import Image from "next/image";
import { useState } from "react";
import { RequestProductButton } from "@/components/request-product-button";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type ProductCardsProps = {
  products: AmazonSearchResult[];
  searchQuery?: string;
};

export function ProductCards({ products, searchQuery }: ProductCardsProps) {
  const [requestedUrl, setRequestedUrl] = useState<string | null>(null);

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.url || index}
          product={product}
          searchQuery={searchQuery}
          requested={requestedUrl === product.url}
          onRequested={() => setRequestedUrl(product.url)}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  searchQuery,
  requested,
  onRequested,
}: {
  product: AmazonSearchResult;
  searchQuery?: string;
  requested: boolean;
  onRequested: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {product.title}
        </h3>

        {product.priceHint ? (
          <p className="text-base font-semibold text-[var(--foreground)]">
            {product.priceHint}
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">Price on request</p>
        )}

        {requested ? (
          <div className="mt-1 rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            <p className="font-medium">Request received</p>
            <p className="mt-1">We&apos;ll follow up shortly.</p>
          </div>
        ) : (
          <RequestProductButton
            product={product}
            searchQuery={searchQuery}
            onSuccess={onRequested}
          />
        )}
      </div>
    </div>
  );
}
