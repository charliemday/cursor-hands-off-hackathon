# Tech Merch Finder Agent

AI agent that finds tech merch and lets customers submit order requests. Built with Next.js, Vercel AI SDK (`ToolLoopAgent`), Modal inference, and Supabase.

## Setup

### 1. Modal inference

```bash
uvx modal setup
uvx modal deploy modal/vllm_inference.py
uvx modal deploy modal/vllm_vision.py
```

Copy the deployed URLs:
- Text agent: `https://your-workspace--merch-vllm-serve.modal.run` → `MODAL_INFERENCE_URL`
- Vision agent: `https://your-workspace--merch-vllm-vision-serve.modal.run` → `MODAL_VISION_URL`

The vision endpoint (Qwen2.5-VL-7B on A100) powers photo upload search. First request after idle may take ~1–2 min while the GPU cold-starts.

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in [supabase/migrations/001_merch_requests.sql](supabase/migrations/001_merch_requests.sql) via the SQL Editor.
3. Copy **Project URL**, **anon key**, and **service role key** from Settings → API.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Set:
- `MODAL_INFERENCE_URL` — URL from text Modal deploy
- `MODAL_VISION_URL` — URL from vision Modal deploy (photo upload search)
- `FIRECRAWL_API_KEY` — from [firecrawl.dev](https://firecrawl.dev)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side inserts)

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Test flow:** search for merch (text or photo upload) → click **Request this** on a product card → row appears in Supabase `merch_requests` table.

## Architecture

- **Modal** — Qwen3-8B (agent) + Qwen2.5-VL-7B (photo analysis) via vLLM
- **Next.js API** — `ToolLoopAgent` orchestrates search + response
- **Firecrawl** — product search (source hidden from customers)
- **Supabase** — stores order requests for manual fulfillment

## Do you need PayPal or Stripe?

Not for this flow. Payment providers are only needed when you want to **collect money in the app**. Storing requests in Supabase is enough for a reseller who fulfills orders manually (invoice later, purchase from supplier, ship to customer).

Add Stripe or PayPal later when you're ready for automated checkout.

## Phase 2 (not yet implemented)

- Shopify search
- Logo compositing / mockups
- Automated checkout
