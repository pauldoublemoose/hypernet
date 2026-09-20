# Search

One SEARCH control opens SEARCH. Filters, search, list/thumbnail views, and shared space cards.

## Driving it

`node .cursor/skills/verify-hypernet/helpers/verify.mjs drive finder`

- SEARCH starts from `[data-shell=search]`. The window title is SEARCH.
- ALL starts pressed. PEOPLE deselects ALL. ALL deselects PEOPLE.
- A search field is present. Typing Anna keeps only matching rows.
- List hover shows a thumbnail in `[data-shell=preview]`.
- Thumbnail view opens a full page expression.
- People, events, groups, calendars, and callouts each have row, thumbnail, and page.
- Callout row, thumbnail, and page show `EXP` plus an expiry date. CALLOUTS is a filter chip. Search for sound engineer keeps the matching call out.
