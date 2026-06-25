import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";
import { getModalOpenAiBaseUrl } from "@/lib/modal-url";

const openAiBaseUrl = getModalOpenAiBaseUrl();

if (!process.env.MODAL_INFERENCE_URL) {
  console.warn(
    "MODAL_INFERENCE_URL is not set. Deploy Modal with: uvx modal deploy modal/vllm_inference.py"
  );
}

export const modalProvider = createOpenAICompatible({
  name: "modal",
  baseURL: openAiBaseUrl,
});

export const modalModel = wrapLanguageModel({
  model: modalProvider("Qwen/Qwen3-8B-FP8"),
  middleware: [
    extractReasoningMiddleware({
      tagName: "think",
      separator: "\n\n",
    }),
  ],
});
