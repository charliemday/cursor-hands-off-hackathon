export function getModalInferenceBaseUrl(): string | undefined {
  return process.env.MODAL_INFERENCE_URL?.replace(/\/$/, "");
}

export function getModalVisionBaseUrl(): string | undefined {
  return process.env.MODAL_VISION_URL?.replace(/\/$/, "");
}

export function getModalOpenAiBaseUrl(): string {
  const baseUrl = getModalInferenceBaseUrl();
  return baseUrl ? `${baseUrl}/v1` : "http://localhost:8000/v1";
}

export function getModalVisionOpenAiBaseUrl(): string {
  const baseUrl = getModalVisionBaseUrl();
  return baseUrl ? `${baseUrl}/v1` : "http://localhost:8001/v1";
}

function validateModalEndpointUrl(
  url: string | undefined,
  envVar: string,
  deployCommand: string,
  exampleApp: string
): { ok: true } | { ok: false; error: string } {
  if (!url) {
    return {
      ok: false,
      error: `${envVar} is not configured. Deploy Modal with: ${deployCommand}`,
    };
  }

  if (url.includes("modal.com/apps/")) {
    return {
      ok: false,
      error: `${envVar} is set to the Modal dashboard URL, not the inference endpoint. Use the URL from \`modal deploy\` output (e.g. https://your-workspace--${exampleApp}-serve.modal.run).`,
    };
  }

  if (!url.endsWith(".modal.run")) {
    return {
      ok: false,
      error: `${envVar} must be the deployed web endpoint (*.modal.run), not the Modal dashboard.`,
    };
  }

  return { ok: true };
}

export function validateModalInferenceUrl(
  url: string | undefined
): { ok: true } | { ok: false; error: string } {
  return validateModalEndpointUrl(
    url,
    "MODAL_INFERENCE_URL",
    "uvx modal deploy modal/vllm_inference.py",
    "merch-vllm"
  );
}

export function validateModalVisionUrl(
  url: string | undefined
): { ok: true } | { ok: false; error: string } {
  return validateModalEndpointUrl(
    url,
    "MODAL_VISION_URL",
    "uvx modal deploy modal/vllm_vision.py",
    "merch-vllm-vision"
  );
}
