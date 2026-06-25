"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequestProductButton } from "@/components/request-product-button";
import { parseProductFromSearchParams } from "@/lib/wassist/build-request-url";

function RequestPageContent() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const product = parseProductFromSearchParams(searchParams);
  const searchQuery = searchParams.get("q") ?? undefined;

  if (!product) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Invalid request link</h1>
        <p className="text-[var(--muted)]">
          This link is missing product details. Try searching again in WhatsApp.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div>
        <p className="text-sm text-[var(--muted)]">Merch request</p>
        <h1 className="mt-1 text-2xl font-semibold">Confirm your selection</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
        <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain p-4"
              sizes="512px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <h2 className="text-base font-medium leading-snug">{product.title}</h2>
          {product.priceHint ? (
            <p className="text-lg font-semibold">{product.priceHint}</p>
          ) : (
            <p className="text-sm text-[var(--muted)]">Price on request</p>
          )}

          {submitted ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
              <p className="font-medium">Request received</p>
              <p className="mt-1">We&apos;ll follow up shortly.</p>
            </div>
          ) : (
            <RequestProductButton
              product={product}
              searchQuery={searchQuery}
              onSuccess={() => setSubmitted(true)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center p-6">
          <p className="text-[var(--muted)]">Loading...</p>
        </main>
      }
    >
      <RequestPageContent />
    </Suspense>
  );
}
