-- Phase B: real admin roles. Membership is managed manually (dashboard SQL
-- only) — the table has RLS enabled with no policies, so the API can never
-- write to it and nobody can grant themselves admin.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Definer so RLS policies can consult it without recursing into admins' RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Ghosting moves from per-browser localStorage to a real column, so it
-- applies to every visitor's graph, not just the admin's own browser.
alter table public.signups
  add column if not exists ghosted boolean not null default false;

create policy "admins can read all signups"
  on public.signups for select
  to authenticated
  using (public.is_admin());

create policy "admins can update signups"
  on public.signups for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Ghosted signups disappear from the public graph.
create or replace view public.graph_signups
with (security_invoker = false) as
select
  s.id,
  s.created_at,
  s.status,
  case
    when np.parts is null or array_length(np.parts, 1) is null then '?'
    when array_length(np.parts, 1) = 1 then upper(left(np.parts[1], 2))
    else upper(left(np.parts[1], 1) || left(np.parts[array_length(np.parts, 1)], 1))
  end as initials,
  s.attended_events,
  s.hyperstition_years,
  s.skills,
  s.locations
from public.signups s
cross join lateral (
  select case
    when s.full_name is null then null
    else array_remove(
      regexp_split_to_array(btrim(regexp_replace(s.full_name, '[.]', ' ', 'g')), '\s+'),
      ''
    )
  end as parts
) np
where not s.ghosted;
