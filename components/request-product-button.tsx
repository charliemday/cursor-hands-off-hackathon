"use client";

import { useState } from "react";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type RequestProductButtonProps = {
  product: AmazonSearchResult;
  searchQuery?: string;
  onSuccess: (requestId: string) => void;
};

export function RequestProductButton({
  product,
  searchQuery,
  onSuccess,
}: RequestProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, searchQuery }),
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "Failed to submit request");
      }

      onSuccess(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-auto">
      <button
        type="button"
        onClick={handleRequest}
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Request this"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
