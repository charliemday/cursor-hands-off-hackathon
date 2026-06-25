import type { WassistInboundPayload } from "@/lib/wassist/types";

const PLACEHOLDER_PATTERN = /^%[A-Z0-9_]+%$/;

export function normalizeInboundImage(image: unknown): string | null {
  if (typeof image !== "string") return null;

  const trimmed = image.trim();
  if (!trimmed || PLACEHOLDER_PATTERN.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function parseWassistInboundPayload(raw: unknown): WassistInboundPayload {
  const data =
    raw &&
    typeof raw === "object" &&
    "request_body" in raw &&
    raw.request_body &&
    typeof raw.request_body === "object"
      ? raw.request_body
      : raw;

  const obj = (data ?? {}) as Record<string, unknown>;

  return {
    message: typeof obj.message === "string" ? obj.message : "",
    image: normalizeInboundImage(obj.image),
    phone_number:
      typeof obj.phone_number === "string" ? obj.phone_number : "",
    reply_callback:
      typeof obj.reply_callback === "string" ? obj.reply_callback : "",
  };
}
