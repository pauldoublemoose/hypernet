-- Freeform "about me" text on a node. Owner-edited from the account page.
-- Readable by owners and admins via existing signups policies; deliberately
-- NOT added to the graph_signups view, so it is never exposed to anon.
alter table public.signups
  add column about text not null default '',
  add constraint signups_about_len check (char_length(about) <= 4000);
