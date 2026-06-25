import type { ToolSet } from "ai";
import type { OnStepFinishEvent } from "ai";

export function logAgentThinking<TOOLS extends ToolSet>(
  stepResult: OnStepFinishEvent<TOOLS>
): void {
  const { stepNumber, reasoningText, text, toolCalls } = stepResult;

  if (reasoningText?.trim()) {
    console.log(
      `[merch-agent][step ${stepNumber}] thinking:\n${reasoningText.trim()}`
    );
  }

  if (text?.trim()) {
    console.log(
      `[merch-agent][step ${stepNumber}] response:\n${text.trim()}`
    );
  }

  if (toolCalls?.length) {
    console.log(
      `[merch-agent][step ${stepNumber}] tools:`,
      toolCalls.map((call) => call.toolName).join(", ")
    );
  }
}
