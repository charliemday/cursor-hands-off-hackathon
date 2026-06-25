import { generateText } from "ai";
import { visionModel } from "@/lib/modal-vision-provider";
import { validateModalVisionUrl } from "@/lib/modal-url";

const DESCRIBE_PROMPT =
  "Describe this merch/product for a catalog search. Return ONLY comma-separated search keywords: product type, color, material, style. No sentences.";

export async function describeImageForSearch(
  imageUrl: string,
  userText?: string
): Promise<string> {
  const validation = validateModalVisionUrl(process.env.MODAL_VISION_URL);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const { text } = await generateText({
    model: visionModel,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: DESCRIBE_PROMPT },
          { type: "image", image: imageUrl },
        ],
      },
    ],
  });

  const keywords = text.trim();
  if (!keywords) {
    throw new Error("Vision model returned an empty product description");
  }

  if (userText?.trim()) {
    return `${keywords}, ${userText.trim()}`;
  }

  return keywords;
}
