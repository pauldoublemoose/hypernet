-- HYPERNET pre-alpha schema
-- Run this in the Supabase SQL editor (or via supabase db push).

create extension if not exists "pgcrypto";

create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null check (status in ('subscriber', 'prospect', 'cocreator', 'legacy', 'admin')),
  full_name text,
  email text,
  phone text,
  discord text,
  facebook text,
  -- rank per channel, e.g. {"email": "primary", "phone": "if-needed"}
  contact_prefs jsonb not null default '{}'::jsonb,
  attended_events text[] not null default '{}',
  contribution_history text,
  hyperstition_years text[] not null default '{}',
  -- array of {category, subcategory, note}
  skills jsonb not null default '[]'::jsonb,
  -- array of {country, city}
  locations jsonb not null default '[]'::jsonb,
  other_info text
);

-- Skills added by signees become selectable options for later visitors.
create table if not exists public.skill_options (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null,
  subcategory text,
  added_by_signup uuid references public.signups (id)
);

-- Countries/cities added by signees become selectable for later visitors.
create table if not exists public.location_options (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  country text not null,
  city text,
  added_by_signup uuid references public.signups (id)
);

alter table public.signups enable row level security;
alter table public.skill_options enable row level security;
alter table public.location_options enable row level security;

-- The public may sign up, but never read other people's contact data.
create policy "anon can sign up"
  on public.signups for insert
  to anon
  with check (true);

-- The public may add and read community skill options.
create policy "anon can add skill options"
  on public.skill_options for insert
  to anon
  with check (true);

create policy "anon can read skill options"
  on public.skill_options for select
  to anon
  using (true);

create policy "anon can add location options"
  on public.location_options for insert
  to anon
  with check (true);

create policy "anon can read location options"
  on public.location_options for select
  to anon
  using (true);

-- Safe to re-run if signups already existed without locations:
alter table public.signups
  add column if not exists locations jsonb not null default '[]'::jsonb;
