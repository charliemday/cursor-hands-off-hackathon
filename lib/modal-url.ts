export function getModalInferenceBaseUrl(): string | undefined {
  return process.env.MODAL_INFERENCE_URL?.replace(/\/$/, "");
}

export function getModalOpenAiBaseUrl(): string {
  const baseUrl = getModalInferenceBaseUrl();
  return baseUrl ? `${baseUrl}/v1` : "http://localhost:8000/v1";
}

export function validateModalInferenceUrl(
  url: string | undefined
): { ok: true } | { ok: false; error: string } {
  if (!url) {
    return {
      ok: false,
      error:
        "MODAL_INFERENCE_URL is not configured. Deploy Modal with: uvx modal deploy modal/vllm_inference.py",
    };
  }

  if (url.includes("modal.com/apps/")) {
    return {
      ok: false,
      error:
        "MODAL_INFERENCE_URL is set to the Modal dashboard URL, not the inference endpoint. Use the URL from `modal deploy` output (e.g. https://your-workspace--merch-vllm-serve.modal.run).",
    };
  }

  if (!url.endsWith(".modal.run")) {
    return {
      ok: false,
      error:
        "MODAL_INFERENCE_URL must be the deployed web endpoint (*.modal.run), not the Modal dashboard.",
    };
  }

  return { ok: true };
}
