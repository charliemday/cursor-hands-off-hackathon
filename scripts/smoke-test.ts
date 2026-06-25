import assert from "node:assert/strict";
import {
  extractPriceHint,
  searchAmazonProducts,
} from "../lib/tools/search-amazon";

async function testPriceExtraction() {
  assert.equal(extractPriceHint("Great cap for $19.99"), "$19.99");
  assert.equal(extractPriceHint("No price here"), undefined);
  console.log("✓ price extraction");
}

async function testSearchWithApiKey() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.log("⊘ skipping live Firecrawl search (FIRECRAWL_API_KEY not set)");
    return;
  }

  const results = await searchAmazonProducts(
    "black custom logo baseball cap",
    3,
    apiKey
  );
  assert.ok(Array.isArray(results));
  assert.ok(results.length > 0, "expected at least one result");
  assert.ok(results[0].title);
  assert.ok(results[0].url.includes("amazon"));
  console.log(`✓ live Firecrawl search (${results.length} results)`);
  console.log(`  sample: ${results[0].title}`);
}

async function main() {
  await testPriceExtraction();
  await testSearchWithApiKey();
  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
