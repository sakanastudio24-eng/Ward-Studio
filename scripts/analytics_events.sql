create extension if not exists pgcrypto;

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  product_id text not null,
  tier_id text null,
  addon_ids jsonb null,
  price_total numeric null,
  deposit_amount numeric null,
  order_id text null,
  session_id text null,
  anonymous_id text not null,
  props jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx
  on analytics_events (created_at desc);

create index if not exists analytics_events_event_name_created_at_idx
  on analytics_events (event_name, created_at desc);

create index if not exists analytics_events_product_id_created_at_idx
  on analytics_events (product_id, created_at desc);

create index if not exists analytics_events_anonymous_id_created_at_idx
  on analytics_events (anonymous_id, created_at desc);
