import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getModalOpenAiBaseUrl } from "@/lib/modal-url";

const openAiBaseUrl = getModalOpenAiBaseUrl();

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
    location: "lib/modal-provider.ts:init",
    message: "Modal provider base URL constructed",
    data: {
      modalInferenceUrl: process.env.MODAL_INFERENCE_URL ?? null,
      openAiBaseUrl,
      isDashboardUrl: process.env.MODAL_INFERENCE_URL?.includes(
        "modal.com/apps/"
      ),
      endsWithModalRun: process.env.MODAL_INFERENCE_URL?.endsWith(".modal.run"),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

if (!process.env.MODAL_INFERENCE_URL) {
  console.warn(
    "MODAL_INFERENCE_URL is not set. Deploy Modal with: uvx modal deploy modal/vllm_inference.py"
  );
}

export const modalProvider = createOpenAICompatible({
  name: "modal",
  baseURL: openAiBaseUrl,
});

export const modalModel = modalProvider("Qwen/Qwen3-8B-FP8");
