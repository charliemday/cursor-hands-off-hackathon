import { createAgentUIStreamResponse } from "ai";
import { merchAgent } from "@/lib/agent/merch-agent";
import {
  getModalOpenAiBaseUrl,
  validateModalInferenceUrl,
} from "@/lib/modal-url";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!process.env.FIRECRAWL_API_KEY) {
    return new Response(
      JSON.stringify({ error: "FIRECRAWL_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const modalValidation = validateModalInferenceUrl(
    process.env.MODAL_INFERENCE_URL
  );

  // #region agent log
  fetch("http://127.0.0.1:7346/ingest/7c45d0bc-69a9-4fda-bae2-e858236e2311", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "e63918",
    },
    body: JSON.stringify({
      sessionId: "e63918",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "app/api/chat/route.ts:POST",
      message: "Chat route Modal URL validation",
      data: {
        modalInferenceUrl: process.env.MODAL_INFERENCE_URL ?? null,
        openAiBaseUrl: getModalOpenAiBaseUrl(),
        validationOk: modalValidation.ok,
        validationError:
          modalValidation.ok === false ? modalValidation.error : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!modalValidation.ok) {
    return new Response(JSON.stringify({ error: modalValidation.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await createAgentUIStreamResponse({
      agent: merchAgent,
      uiMessages: messages,
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7346/ingest/7c45d0bc-69a9-4fda-bae2-e858236e2311", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e63918",
      },
      body: JSON.stringify({
        sessionId: "e63918",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "app/api/chat/route.ts:POST:catch",
        message: "Agent stream failed",
        data: {
          errorName: error instanceof Error ? error.name : "unknown",
          errorMessage: error instanceof Error ? error.message : String(error),
          openAiBaseUrl: getModalOpenAiBaseUrl(),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
}
