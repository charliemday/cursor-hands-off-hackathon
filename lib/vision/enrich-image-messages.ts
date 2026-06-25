import type { MerchAgentUIMessage } from "@/lib/agent/types";
import { describeImageForSearch } from "@/lib/vision/describe-image";

function isImageFilePart(
  part: MerchAgentUIMessage["parts"][number]
): part is Extract<MerchAgentUIMessage["parts"][number], { type: "file" }> {
  return (
    part.type === "file" &&
    "url" in part &&
    typeof part.url === "string" &&
    part.mediaType.startsWith("image/")
  );
}

function getUserText(parts: MerchAgentUIMessage["parts"]): string | undefined {
  const text = parts
    .filter((part) => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ");

  return text || undefined;
}

export function lastUserMessageHasImage(messages: MerchAgentUIMessage[]): boolean {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts.some(isImageFilePart);
  }
  return false;
}

export async function enrichImageMessages(
  messages: MerchAgentUIMessage[]
): Promise<MerchAgentUIMessage[]> {
  const enriched = structuredClone(messages);

  for (let i = enriched.length - 1; i >= 0; i--) {
    const message = enriched[i];
    if (message.role !== "user") continue;

    const imagePart = message.parts.find(isImageFilePart);
    if (!imagePart) continue;

    const userText = getUserText(message.parts);
    const keywords = await describeImageForSearch(imagePart.url, userText);

    const nonImageParts = message.parts.filter((part) => !isImageFilePart(part));
    message.parts = [
      ...nonImageParts.filter((part) => part.type !== "text"),
      { type: "text", text: `[Reference photo] ${keywords}` },
    ];
    break;
  }

  return enriched;
}
