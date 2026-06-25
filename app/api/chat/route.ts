import { createAgentUIStreamResponse } from "ai";
import { merchAgent } from "@/lib/agent/merch-agent";
import type { MerchAgentUIMessage } from "@/lib/agent/types";
import { validateGeminiApiKey } from "@/lib/gemini-provider";
import {
  enrichImageMessages,
  lastUserMessageHasImage,
} from "@/lib/vision/enrich-image-messages";
import { logAgentThinking } from "@/lib/agent/log-reasoning";

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

  const geminiValidation = validateGeminiApiKey();
  if (!geminiValidation.ok) {
    return new Response(JSON.stringify({ error: geminiValidation.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
    sendReasoning: true,
    onStepFinish: logAgentThinking,
  });
}
