-- Graph-safe projection of signups for the public network visualization.
-- Names are reduced to initials inside the database so full names and
-- contact data never reach the browser.
create view public.graph_signups
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
) np;

comment on view public.graph_signups is
  'Anonymized signups for the public network graph: initials only, no contact columns. Runs with owner rights so RLS on signups stays fully closed to direct reads.';

revoke all on public.graph_signups from anon, authenticated;
grant select on public.graph_signups to anon, authenticated;
