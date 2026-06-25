import assert from "node:assert/strict";
import {
  extractPriceHint,
  pickProductImage,
  searchAmazonProducts,
} from "../lib/tools/search-amazon";

async function testPriceExtraction() {
  assert.equal(extractPriceHint("Great cap for $19.99"), "$19.99");
  assert.equal(extractPriceHint("No price here"), undefined);
  console.log("✓ price extraction");
}

async function testPickProductImage() {
  assert.equal(
    pickProductImage(
      [
        "https://example.com/logo.png",
        "https://m.media-amazon.com/images/I/abc.jpg",
      ],
      undefined
    ),
    "https://m.media-amazon.com/images/I/abc.jpg"
  );
  assert.equal(
    pickProductImage(undefined, "https://example.com/og.png"),
    "https://example.com/og.png"
  );
  assert.equal(pickProductImage([], undefined), undefined);
  console.log("✓ image picking");
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
  assert.ok(results.length <= 3, "expected at most 3 results");
  assert.ok(results[0].title);
  assert.ok(results[0].url.includes("amazon"));
  assert.ok("imageUrl" in results[0]);
  console.log(`✓ live Firecrawl search (${results.length} results)`);
  console.log(`  sample: ${results[0].title}`);
  if (results[0].imageUrl) {
    console.log(`  image: ${results[0].imageUrl.slice(0, 60)}...`);
  } else {
    console.log("  image: (none — placeholder will show in UI)");
  }
}

async function main() {
  await testPriceExtraction();
  await testPickProductImage();
  await testSearchWithApiKey();
  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
