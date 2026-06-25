export function formatWhatsAppSummary(
  text: string,
  productMessagesSent: number
): string {
  const cleaned = text
    .replace(/click\s+"Request this"[^.\n]*/gi, "")
    .replace(/product cards?[^.\n]*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const fallback = "Here are some options that might work for you.";
  const summary = cleaned || fallback;

  if (productMessagesSent <= 0) return summary;

  return `${summary}\n\nTap the link under each option to submit a request.`;
}
