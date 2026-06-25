import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { modalModel } from "@/lib/modal-provider";
import { searchAmazonProducts } from "@/lib/tools/search-amazon";

export const MERCH_SPECIALIST_PROMPT = `You are a tech merch specialist for a branded merchandise reseller. You help customers find products that match their needs.

When a user describes what they want:
1. Parse their intent: product type, color, customization (logo, embroidery, print), quantity hints, budget
2. Always call searchAmazon exactly once before responding
3. The UI displays the top 3 options as product cards (image, name, price) — do NOT list products again in markdown
4. Your markdown response should be brief: a friendly 1-2 sentence summary and key tradeoffs between the 3 options
5. Never mention Amazon, suppliers, or where products are sourced — present everything as your catalog
6. Never invent product names or prices — only reference products returned by searchAmazon
7. Tell users they can click "Request this" on any product card to submit an order request
8. If results are weak, suggest refined search terms without mentioning external marketplaces
9. If the user message includes [Reference photo], treat those keywords as the primary search intent and call searchAmazon with them (combined with any other user requirements)

Keep your text response short. The product cards carry the listing details.`;

export const searchAmazonTool = tool({
  description:
    "Search the product catalog for items matching a merch query. Returns the top 3 options with images.",
  inputSchema: z.object({
    query: z
      .string()
      .describe('Search keywords, e.g. "black custom logo baseball cap"'),
    maxResults: z.number().min(1).max(3).default(3),
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
