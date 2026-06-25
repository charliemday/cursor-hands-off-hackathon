import { createAgentUIStreamResponse } from "ai";
import { merchAgent } from "@/lib/agent/merch-agent";
import type { MerchAgentUIMessage } from "@/lib/agent/types";
import {
  validateModalInferenceUrl,
  validateModalVisionUrl,
} from "@/lib/modal-url";
import {
  enrichImageMessages,
  lastUserMessageHasImage,
} from "@/lib/vision/enrich-image-messages";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: MerchAgentUIMessage[];
  };

  if (!process.env.FIRECRAWL_API_KEY) {
    return new Response(
      JSON.stringify({ error: "FIRECRAWL_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const modalValidation = validateModalInferenceUrl(
    process.env.MODAL_INFERENCE_URL
  );

  if (!modalValidation.ok) {
    return new Response(JSON.stringify({ error: modalValidation.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (lastUserMessageHasImage(messages)) {
    const visionValidation = validateModalVisionUrl(
      process.env.MODAL_VISION_URL
    );

    if (!visionValidation.ok) {
      return new Response(JSON.stringify({ error: visionValidation.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  let uiMessages = messages;
  try {
    if (lastUserMessageHasImage(messages)) {
      uiMessages = await enrichImageMessages(messages);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze uploaded image";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return createAgentUIStreamResponse({
    agent: merchAgent,
    uiMessages,
  });
}
