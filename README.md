# Tech Merch Finder Agent

AI agent that finds tech merch and lets customers submit order requests. Built with Next.js, Vercel AI SDK (`ToolLoopAgent`), Google Gemini, and Supabase.

## Setup

### 1. Google Gemini API key

1. Get an API key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`.

The app uses **Gemini 2.5 Flash** for both the merch agent and photo analysis (vision).

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in [supabase/migrations/001_merch_requests.sql](supabase/migrations/001_merch_requests.sql) via the SQL Editor.
3. Copy **Project URL**, **anon key**, and **service role key** from Settings → API.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Set:
- `GOOGLE_GENERATIVE_AI_API_KEY` — from Google AI Studio
- `FIRECRAWL_API_KEY` — from [firecrawl.dev](https://firecrawl.dev)
- `NEXT_PUBLIC_APP_URL` — public app URL for WhatsApp request links (optional unless using Wassist)
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

### 5. WhatsApp via Wassist

Connect inbound WhatsApp messages to the same merch agent (search + reply only — no Wassist API keys required).

1. Set `NEXT_PUBLIC_APP_URL` to your public HTTPS origin (e.g. `https://your-app.vercel.app`) so WhatsApp messages include clickable request links.
2. Deploy the app to a public HTTPS URL (e.g. Vercel), or expose local dev with `ngrok http 3000`.
3. In the [Wassist dashboard](https://wassist.app/agents), create an agent using **Bring Your Own Agent**.
4. Set the webhook URL to `https://<your-host>/api/webhooks/wassist`.
5. Deploy the agent and test via the sandbox `connectUrl` shown in the agent overview.
6. Send a message like *"black custom logo baseball cap"* — you should receive three product image messages (each with a `Request this:` link), then a brief text summary.

Each product message includes a link to `/request?...` where the customer can confirm and submit an order request. Photo messages work when `GOOGLE_GENERATIVE_AI_API_KEY` is configured (same as the web UI).

## Architecture

- **Google Gemini** — Gemini 2.5 Flash (agent + photo analysis)
- **Next.js API** — `ToolLoopAgent` orchestrates search + response
- **Firecrawl** — product search (source hidden from customers)
- **Supabase** — stores order requests for manual fulfillment
- **Wassist BYOA** — WhatsApp inbound webhook at `/api/webhooks/wassist` (optional)

## Do you need PayPal or Stripe?

Not for this flow. Payment providers are only needed when you want to **collect money in the app**. Storing requests in Supabase is enough for a reseller who fulfills orders manually (invoice later, purchase from supplier, ship to customer).

Add Stripe or PayPal later when you're ready for automated checkout.

## Phase 2 (not yet implemented)

- Shopify search
- Logo compositing / mockups
- Automated checkout

## Legacy Modal deployment (optional)

The `modal/` folder contains a previous vLLM deployment (Qwen3-8B + Qwen2.5-VL). It is no longer used by the app but kept for reference.
