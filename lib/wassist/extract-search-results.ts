import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type SearchAmazonOutput = {
  results?: AmazonSearchResult[];
};

type AgentGenerateResult = {
  steps: Array<{
    toolResults: Array<{
      toolName: string;
      output?: unknown;
    }>;
  }>;
};

export function extractSearchResults(
  result: AgentGenerateResult
): AmazonSearchResult[] {
  for (const step of result.steps) {
    for (const toolResult of step.toolResults) {
      if (toolResult.toolName !== "searchAmazon") continue;

      const output = toolResult.output as SearchAmazonOutput | undefined;
      if (output?.results?.length) {
        return output.results;
      }
    }
  }

  return [];
}
