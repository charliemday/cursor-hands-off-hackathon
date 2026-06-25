import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getModalVisionOpenAiBaseUrl } from "@/lib/modal-url";

const openAiBaseUrl = getModalVisionOpenAiBaseUrl();

if (!process.env.MODAL_VISION_URL) {
  console.warn(
    "MODAL_VISION_URL is not set. Deploy Modal with: uvx modal deploy modal/vllm_vision.py"
  );
}

export const modalVisionProvider = createOpenAICompatible({
  name: "modal-vision",
  baseURL: openAiBaseUrl,
});

export const VISION_MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct";

export const visionModel = modalVisionProvider(VISION_MODEL_ID);
