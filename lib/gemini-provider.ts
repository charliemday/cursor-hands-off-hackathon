import { google } from "@ai-sdk/google";

export const agentModel = google("gemini-2.5-flash");

export const visionModel = google("gemini-2.5-flash");

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

export function validateGeminiApiKey():
  | { ok: true }
  | { ok: false; error: string } {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      ok: false,
      error:
        "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Get a key at https://aistudio.google.com/apikey",
    };
  }
  return { ok: true };
}
