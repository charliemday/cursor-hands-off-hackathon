"use client";

type ReasoningDropdownProps = {
  text: string;
  isStreaming?: boolean;
};

export function ReasoningDropdown({ text, isStreaming }: ReasoningDropdownProps) {
  if (!text.trim()) return null;

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block transition group-open:rotate-90">▸</span>
          {isStreaming ? "Thinking..." : "View thinking"}
        </span>
      </summary>
      <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span className="ml-0.5 inline-block animate-pulse">▍</span>
        )}
      </div>
    </details>
  );
}

const THINK_TAG = "think";

export function stripEmbeddedThinking(text: string): string {
  const pattern = new RegExp(
    `<${THINK_TAG}>[\\s\\S]*?<\\/${THINK_TAG}>`,
    "gi"
  );
  return text.replace(pattern, "").trim();
}

export function collectReasoningText(
  parts: Array<{ type: string; text?: string; state?: string }>
): { reasoning: string; isStreaming: boolean } {
  const reasoningParts = parts.filter((part) => part.type === "reasoning");
  const reasoning = reasoningParts.map((part) => part.text ?? "").join("\n\n");

  const isStreaming = reasoningParts.some((part) => part.state === "streaming");

  return { reasoning, isStreaming };
}
