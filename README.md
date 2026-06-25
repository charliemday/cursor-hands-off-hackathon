# Tech Merch Finder Agent

AI agent that finds tech merch on Amazon. Built with Next.js, Vercel AI SDK (`ToolLoopAgent`), and Modal-hosted inference.

## Setup

### 1. Modal inference

```bash
uvx modal setup
uvx modal deploy modal/vllm_inference.py
```

Copy the deployed URL (e.g. `https://your-workspace--merch-vllm-serve.modal.run`).

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Set:
- `MODAL_INFERENCE_URL` — URL from Modal deploy
- `FIRECRAWL_API_KEY` — from [firecrawl.dev](https://firecrawl.dev)

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Modal** — Qwen3-8B via vLLM (OpenAI-compatible `/v1` endpoint)
- **Next.js API** — `ToolLoopAgent` orchestrates search + response
- **Firecrawl** — Amazon product search via `/v2/search` with `site:amazon.com` and domain filters

## Phase 2 (not yet implemented)

- Shopify search
- Logo upload
- Checkout via Shopify API
