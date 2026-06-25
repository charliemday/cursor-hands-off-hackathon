create table if not exists public.merch_requests (
  id uuid primary key default gen_random_uuid(),
  product_title text not null,
  product_price text,
  product_image_url text,
  source_url text not null,
  search_query text,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists merch_requests_created_at_idx
  on public.merch_requests (created_at desc);

alter table public.merch_requests enable row level security;

-- Allow anonymous inserts from the app (server uses anon key or service role)
create policy "Allow public insert"
  on public.merch_requests
  for insert
  to anon, authenticated
  with check (true);

-- Reads restricted to service role only (view in Supabase dashboard)
