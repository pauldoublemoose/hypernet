-- Phase A of accounts: profiles, signup ownership, and claim-by-verified-email.

-- Living social identity, distinct from the historical signup intake row.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text not null default ''
);

alter table public.profiles enable row level security;

create policy "owner can read own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "owner can update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Signup rows become claimable by the verified owner of their email.
alter table public.signups
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists signups_user_id_idx on public.signups (user_id);

create policy "owner can read own signups"
  on public.signups for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "owner can update own signups"
  on public.signups for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Logged-in visitors can still use the public signup flow.
create policy "authenticated can sign up"
  on public.signups for insert
  to authenticated
  with check (user_id is null or user_id = (select auth.uid()));

create policy "authenticated can add skill options"
  on public.skill_options for insert
  to authenticated
  with check (true);

create policy "authenticated can read skill options"
  on public.skill_options for select
  to authenticated
  using (true);

create policy "authenticated can add location options"
  on public.location_options for insert
  to authenticated
  with check (true);

create policy "authenticated can read location options"
  on public.location_options for select
  to authenticated
  using (true);

-- Claim every unowned signup whose email matches the caller's VERIFIED login
-- email, and seed a profile from the newest one. Runs as definer because the
-- rows being claimed are, by definition, not yet readable by the caller.
create or replace function public.claim_signups()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  login_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  claimed integer;
  latest_name text;
begin
  if uid is null or login_email = '' then
    return 0;
  end if;

  update public.signups s
     set user_id = uid
   where s.user_id is null
     and lower(coalesce(s.email, '')) = login_email;
  get diagnostics claimed = row_count;

  select s.full_name into latest_name
    from public.signups s
   where s.user_id = uid
   order by s.created_at desc
   limit 1;

  insert into public.profiles (id, display_name)
  values (uid, coalesce(latest_name, ''))
  on conflict (id) do nothing;

  return claimed;
end;
$$;

revoke all on function public.claim_signups() from public, anon;
grant execute on function public.claim_signups() to authenticated;
