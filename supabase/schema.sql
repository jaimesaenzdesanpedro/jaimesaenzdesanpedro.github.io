-- AlphaLens database schema
-- Run in the Supabase SQL editor once a project is connected.
--
-- NOTE: authentication is handled by Clerk, so the primary key for `users` is
-- the Clerk user id (a string like "user_2abc..."), NOT a Supabase auth.users
-- uuid. user_id columns are therefore `text`. Storing Clerk ids in uuid columns
-- is what caused inserts to fail silently and reports to show "not found".

create table if not exists users (
  id text primary key,                       -- Clerk user id
  email text,
  plan text default 'free',
  monthly_searches int default 0,
  searches_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists research_history (
  id uuid default gen_random_uuid() primary key,
  user_id text references users(id),
  sector text,
  filters jsonb,
  result jsonb,
  created_at timestamptz default now()
);

create table if not exists watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id text references users(id),
  ticker text,
  company_name text,
  domain text,
  added_at timestamptz default now()
);

-- Helpful indexes
create index if not exists research_history_user_idx on research_history (user_id, created_at desc);
create index if not exists watchlist_user_idx on watchlist (user_id, added_at desc);

-- If you previously created these tables with uuid user ids, run instead:
--   alter table research_history drop constraint if exists research_history_user_id_fkey;
--   alter table watchlist        drop constraint if exists watchlist_user_id_fkey;
--   alter table users            alter column id type text using id::text;
--   alter table research_history alter column user_id type text using user_id::text;
--   alter table watchlist        alter column user_id type text using user_id::text;
--   alter table research_history add constraint research_history_user_id_fkey foreign key (user_id) references users(id);
--   alter table watchlist        add constraint watchlist_user_id_fkey foreign key (user_id) references users(id);
