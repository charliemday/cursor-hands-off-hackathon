import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { modalModel } from "@/lib/modal-provider";
import { searchAmazonProducts } from "@/lib/tools/search-amazon";

export const MERCH_SPECIALIST_PROMPT = `You are a tech merch sourcing specialist. You help teams find branded merchandise on Amazon.

When a user describes what they want:
1. Parse their intent: product type, color, customization (logo, embroidery, print), quantity hints, budget
2. Always call searchAmazon at least once before recommending products
3. Return 3-5 options ranked by fit, with honest tradeoffs
4. Include direct Amazon links from search results only — never invent ASINs, URLs, or prices
5. Flag prices as approximate and tell users to verify on the product page
6. If results are weak, say so and suggest refined search terms or alternative product types
7. End with a brief note that checkout will be handled in a future phase once they pick an option

Format responses in Markdown with clear headings and bullet points.`;

export const searchAmazonTool = tool({
  description:
    "Search Amazon for products matching a merch query. Use specific keywords including product type, color, and customization terms.",
  inputSchema: z.object({
    query: z
      .string()
      .describe('Search keywords, e.g. "black custom logo baseball cap"'),
    maxResults: z.number().min(1).max(10).default(5),
  }),
  execute: async ({ query, maxResults }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }
    const results = await searchAmazonProducts(query, maxResults, apiKey);
    return { query, results, count: results.length };
  },
});

export const merchAgent = new ToolLoopAgent({
  model: modalModel,
  instructions: MERCH_SPECIALIST_PROMPT,
  tools: { searchAmazon: searchAmazonTool },
  stopWhen: stepCountIs(10),
});
