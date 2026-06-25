"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { MerchAgentUIMessage } from "@/lib/agent/types";

const EXAMPLE_PROMPTS = [
  "A black hat with our logo on it",
  "Company hoodies for a team of 20",
  "Branded wireless chargers for a conference",
];

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, error } =
    useChat<MerchAgentUIMessage>({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const text = input.value.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    input.value = "";
  }

  function handleExample(prompt: string) {
    if (isLoading) return;
    sendMessage({ text: prompt });
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <h1 className="text-lg font-semibold">Tech Merch Finder</h1>
        <p className="text-sm text-[var(--muted)]">
          Describe the merch you need — I&apos;ll search Amazon and suggest
          options.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-[var(--muted)]">
              Try one of these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleExample(prompt)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-[var(--accent)] px-4 py-3 text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                }
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return message.role === "assistant" ? (
                      <div
                        key={i}
                        className="prose prose-sm max-w-none dark:prose-invert prose-a:text-[var(--accent)]"
                      >
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p key={i}>{part.text}</p>
                    );
                  }

                  if (part.type === "tool-searchAmazon") {
                    if (
                      part.state === "input-streaming" ||
                      part.state === "input-available"
                    ) {
                      return (
                        <p
                          key={i}
                          className="text-sm text-[var(--muted)] italic"
                        >
                          Searching Amazon...
                        </p>
                      );
                    }
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <p className="text-sm text-[var(--muted)]">
                  {status === "submitted"
                    ? "Warming up model and thinking..."
                    : "Generating response..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4"
      >
        <div className="mx-auto flex max-w-2xl gap-3">
          <input
            name="message"
            type="text"
            placeholder="e.g. A black hat with our logo on it"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
