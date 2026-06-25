import type { AmazonSearchResult } from "@/lib/tools/search-amazon";

type SearchAmazonOutput = {
  query?: string;
  results?: AmazonSearchResult[];
};

export type ExtractedSearchResults = {
  products: AmazonSearchResult[];
  searchQuery?: string;
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
): ExtractedSearchResults {
  for (const step of result.steps) {
    for (const toolResult of step.toolResults) {
      if (toolResult.toolName !== "searchAmazon") continue;

      const output = toolResult.output as SearchAmazonOutput | undefined;
      if (output?.results?.length) {
        return {
          products: output.results,
          searchQuery: output.query,
        };
      }
    }
  }

  return { products: [] };
}
