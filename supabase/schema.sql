-- AlphaLens database schema
-- Run in the Supabase SQL editor once a project is connected.

create table if not exists users (
  id uuid references auth.users primary key,
  email text,
  plan text default 'free',
  monthly_searches int default 0,
  searches_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists research_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  sector text,
  filters jsonb,
  result jsonb,
  created_at timestamptz default now()
);

create table if not exists watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  ticker text,
  company_name text,
  domain text,
  added_at timestamptz default now()
);

-- Helpful indexes
create index if not exists research_history_user_idx on research_history (user_id, created_at desc);
create index if not exists watchlist_user_idx on watchlist (user_id, added_at desc);
