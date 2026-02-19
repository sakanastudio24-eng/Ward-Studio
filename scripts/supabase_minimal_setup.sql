create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  product_id text not null,
  tier_id text not null,
  addon_ids jsonb not null default '[]'::jsonb,
  customer_email text not null,
  stripe_session_id text null,
  email_sent_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_created_at_idx on orders (status, created_at desc);
create index if not exists orders_customer_email_idx on orders (customer_email);
create unique index if not exists orders_stripe_session_id_unique_idx
  on orders (stripe_session_id)
  where stripe_session_id is not null;

create table if not exists onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(order_id) on delete cascade,
  config_json jsonb not null default '{}'::jsonb,
  asset_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_submissions_order_id_created_at_idx
  on onboarding_submissions (order_id, created_at desc);
