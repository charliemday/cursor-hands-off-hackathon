"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  FormEvent,
  useMemo,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import { ProductCards } from "@/components/product-cards";
import {
  ReasoningDropdown,
  collectReasoningText,
  stripEmbeddedThinking,
} from "@/components/reasoning-dropdown";
import type { MerchAgentUIMessage } from "@/lib/agent/types";
import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

const EXAMPLE_PROMPTS = [
  "A black hat with our logo on it",
  "Company hoodies for a team of 20",
  "Branded wireless chargers for a conference",
  "Find something like this photo",
];

const MAX_IMAGE_DIMENSION = 1024;

async function resizeImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );

  if (scale >= 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type || "image/jpeg", 0.85)
  );

  if (!blob) return file;
  return new File([blob], file.name, { type: blob.type });
}

function getProductResults(
  message: MerchAgentUIMessage
): AmazonSearchResult[] | null {
  for (const part of message.parts) {
    if (
      part.type === "tool-searchAmazon" &&
      part.state === "output-available" &&
      part.output?.results
    ) {
      return part.output.results.slice(0, 3);
    }
  }
  return null;
}

function getSearchQuery(message: MerchAgentUIMessage): string | undefined {
  for (const part of message.parts) {
    if (
      part.type === "tool-searchAmazon" &&
      part.state === "output-available" &&
      part.output?.query
    ) {
      return part.output.query;
    }
  }
  return undefined;
}

function isSearching(message: MerchAgentUIMessage): boolean {
  return message.parts.some(
    (part) =>
      part.type === "tool-searchAmazon" &&
      (part.state === "input-streaming" || part.state === "input-available")
  );
}

function messageHasImage(message: MerchAgentUIMessage): boolean {
  return message.parts.some(
    (part) =>
      part.type === "file" && part.mediaType?.startsWith("image/")
  );
}

function AssistantBubble({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={
          wide
            ? "w-full max-w-3xl rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
            : "max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, error } =
    useChat<MerchAgentUIMessage>({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const awaitingPhotoAnalysis =
    status === "submitted" &&
    lastUserMessage != null &&
    messageHasImage(lastUserMessage);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearSelectedFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(file: File | undefined) {
    clearSelectedFile();
    if (!file) return;

    const resized = await resizeImageFile(file);
    setSelectedFile(resized);
    setPreviewUrl(URL.createObjectURL(resized));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const text = input.value.trim();

    if ((!text && !selectedFile) || isLoading) return;

    if (selectedFile) {
      const dt = new DataTransfer();
      dt.items.add(selectedFile);
      sendMessage({
        text: text || "Find merch like this photo",
        files: dt.files,
      });
    } else {
      sendMessage({ text });
    }

    input.value = "";
    clearSelectedFile();
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
          Describe the merch you need or upload a reference photo — we&apos;ll
          find options and you can request what you like.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-3xl">
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

        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] space-y-2 rounded-2xl rounded-br-md bg-[var(--accent)] px-4 py-3 text-white">
                    {message.parts.map((part, i) => {
                      if (part.type === "text" && part.text.trim()) {
                        return <p key={i}>{part.text}</p>;
                      }
                      if (
                        part.type === "file" &&
                        part.mediaType?.startsWith("image/")
                      ) {
                        return (
                          <img
                            key={i}
                            src={part.url}
                            alt={part.filename ?? "Uploaded reference"}
                            className="max-h-40 rounded-lg"
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            }

            const products = getProductResults(message);
            const searchQuery = getSearchQuery(message);
            const searching = isSearching(message);
            const { reasoning, isStreaming: reasoningStreaming } =
              collectReasoningText(message.parts);
            const textParts = message.parts.filter(
              (part) =>
                part.type === "text" && stripEmbeddedThinking(part.text).trim()
            );
            const toolError = message.parts.find(
              (part) =>
                part.type === "tool-searchAmazon" &&
                part.state === "output-error"
            );

            return (
              <div key={message.id} className="flex flex-col gap-4">
                {reasoning && (
                  <AssistantBubble>
                    <ReasoningDropdown
                      text={reasoning}
                      isStreaming={reasoningStreaming}
                    />
                  </AssistantBubble>
                )}

                {searching && (
                  <AssistantBubble>
                    <p className="text-sm text-[var(--muted)] italic">
                      Finding options for you...
                    </p>
                  </AssistantBubble>
                )}

                {products && (
                  <AssistantBubble wide>
                    <ProductCards
                      products={products}
                      searchQuery={searchQuery}
                    />
                  </AssistantBubble>
                )}

                {textParts.map((part, i) =>
                  part.type === "text" ? (
                    <AssistantBubble key={i}>
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-a:text-[var(--accent)]">
                        <ReactMarkdown>
                          {stripEmbeddedThinking(part.text)}
                        </ReactMarkdown>
                      </div>
                    </AssistantBubble>
                  ) : null
                )}

                {toolError &&
                  toolError.type === "tool-searchAmazon" &&
                  toolError.state === "output-error" && (
                    <AssistantBubble>
                      <p className="text-sm text-red-600">
                        Couldn&apos;t find products right now. Please try again.
                      </p>
                    </AssistantBubble>
                  )}
              </div>
            );
          })}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <AssistantBubble>
              <p className="text-sm text-[var(--muted)]">
                {awaitingPhotoAnalysis
                  ? "Analyzing your photo..."
                  : status === "submitted"
                    ? "Warming up..."
                    : "Generating response..."}
              </p>
            </AssistantBubble>
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
        <div className="mx-auto max-w-3xl space-y-3">
          {previewUrl && (
            <div className="flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Selected reference"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <span className="flex-1 truncate text-sm text-[var(--muted)]">
                {selectedFile?.name}
              </span>
              <button
                type="button"
                onClick={clearSelectedFile}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileChange(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm transition hover:border-[var(--accent)] disabled:opacity-50"
              aria-label="Upload reference photo"
            >
              Photo
            </button>
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
        </div>
      </form>
    </div>
  );
}
