import { merchAgent } from "@/lib/agent/merch-agent";
import { validateGeminiApiKey } from "@/lib/gemini-provider";
import { extractSearchResults } from "@/lib/wassist/extract-search-results";
import { formatWhatsAppSummary } from "@/lib/wassist/format-whatsapp-summary";
import { sendProductReplies } from "@/lib/wassist/send-product-replies";
import type { WassistInboundPayload } from "@/lib/wassist/types";
import { describeImageForSearch } from "@/lib/vision/describe-image";

export const maxDuration = 120;

function wassistReply(content: string, status = 200) {
  return Response.json({ content }, { status });
}

function validateEnv(hasImage: boolean): Response | null {
  if (!process.env.FIRECRAWL_API_KEY) {
    return wassistReply(
      "Sorry, the catalog search is not configured. Please try again later."
    );
  }

  const geminiValidation = validateGeminiApiKey();
  if (!geminiValidation.ok) {
    return wassistReply(
      "Sorry, the agent is not configured. Please try again later."
    );
  }

  if (hasImage && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return wassistReply(
      "Sorry, photo search is not configured. Please try again with text only."
    );
  }

  return null;
}

async function buildUserPrompt(
  message: string,
  image: string | null
): Promise<string> {
  if (!image) {
    return withWhatsAppChannelHint(message.trim() || "Help me find merch");
  }

  const keywords = await describeImageForSearch(image, message.trim() || undefined);
  return withWhatsAppChannelHint(`[Reference photo] ${keywords}`);
}

function withWhatsAppChannelHint(prompt: string): string {
  return `${prompt}\n\n[System: WhatsApp channel. Product request links are sent separately. Do not mention "Request this" buttons or product cards.]`;
}

export async function POST(req: Request) {
  let payload: WassistInboundPayload;

  try {
    payload = (await req.json()) as WassistInboundPayload;
  } catch {
    return wassistReply("Sorry, I couldn't read your message. Please try again.");
  }

  const { message, image, phone_number: phoneNumber, reply_callback: replyCallback } = payload;

  const envError = validateEnv(Boolean(image));
  if (envError) return envError;

  try {
    const userPrompt = await buildUserPrompt(message ?? "", image);
    const result = await merchAgent.generate({ prompt: userPrompt });
    const { products, searchQuery } = extractSearchResults(result);

    if (products.length > 0 && replyCallback) {
      await sendProductReplies(replyCallback, products, {
        searchQuery,
        phoneNumber,
      });
    }

    const summary = formatWhatsAppSummary(result.text, products.length > 0);

    return wassistReply(summary);
  } catch (error) {
    console.error("Wassist webhook error:", error);
    return wassistReply(
      "Sorry, something went wrong. Please try again."
    );
  }
}
