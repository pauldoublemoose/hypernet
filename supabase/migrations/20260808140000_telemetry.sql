-- Anonymous usage telemetry: random per-session ids, no personal data.
-- Anyone may append events; only admins may read; aggregation happens in
-- telemetry_summary() so the client never pulls raw event rows.

create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event text not null,
  screen text,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists telemetry_events_created_idx
  on public.telemetry_events (created_at);
create index if not exists telemetry_events_session_idx
  on public.telemetry_events (session_id);

alter table public.telemetry_events enable row level security;

create policy "anyone can log events"
  on public.telemetry_events for insert
  to anon, authenticated
  with check (true);

create policy "admins can read events"
  on public.telemetry_events for select
  to authenticated
  using (public.is_admin());

create or replace function public.telemetry_summary(days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => days);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with ev as (
    select * from telemetry_events where created_at >= since
  ),
  starts as (
    select session_id, min(created_at) as started_at
    from ev where event = 'signup_started' group by 1
  ),
  completions as (
    select session_id, min(created_at) as completed_at
    from ev where event = 'signup_completed' group by 1
  ),
  durations as (
    select extract(epoch from c.completed_at - s.started_at) as secs
    from completions c
    join starts s using (session_id)
    where c.completed_at > s.started_at
  ),
  abandoned_last as (
    -- Last flow screen seen by sessions that started but never finished.
    select distinct on (e.session_id) e.session_id, e.screen
    from ev e
    join starts s using (session_id)
    left join completions c using (session_id)
    where c.session_id is null and e.event = 'screen' and e.screen is not null
    order by e.session_id, e.created_at desc
  ),
  daily as (
    select
      date_trunc('day', created_at)::date as day,
      count(distinct session_id) filter (where event = 'visit') as visits,
      count(distinct session_id) filter (where event = 'signup_started') as starts,
      count(distinct session_id) filter (where event = 'signup_completed') as completions
    from ev
    group by 1
    order by 1 desc
    limit 30
  )
  select jsonb_build_object(
    'days', days,
    'visits', (select count(distinct session_id) from ev where event = 'visit'),
    'signup_starts', (select count(*) from starts),
    'signup_completions', (select count(*) from completions),
    'graph_opens', (select count(distinct session_id) from ev where event = 'graph_opened'),
    'draft_restores', (select count(distinct session_id) from ev where event = 'draft_restored'),
    'median_completion_secs',
      (select percentile_cont(0.5) within group (order by secs) from durations),
    'p90_completion_secs',
      (select percentile_cont(0.9) within group (order by secs) from durations),
    'drop_off', coalesce(
      (select jsonb_object_agg(screen, n)
         from (select screen, count(*) as n from abandoned_last group by 1) t),
      '{}'::jsonb),
    'daily', coalesce(
      (select jsonb_agg(to_jsonb(d) order by d.day desc) from daily d),
      '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.telemetry_summary(integer) from public, anon;
grant execute on function public.telemetry_summary(integer) to authenticated;
