# HYPERNET // Pre-Alpha Signup Terminal

A retro CRT-terminal signup form that registers co-creators into the HYPERNET
database — a network born from the regolith ashes of the Borderland project
HYPERSTITION.

Black-on-white VT323 terminal in a polished chrome frame, keyboard-driven.

## Running locally

```bash
npm install
npm run dev
```

The app works without any configuration: if no Supabase credentials are set,
signups are cached in the browser's localStorage (key
`hypernet_pending_signups`) and the terminal reports `UPLINK OFFLINE`.

## Wiring up the database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `signups` and `skill_options` tables with row-level
   security: anonymous visitors can insert signups and read/add skill
   options, but can never read anyone's contact data.
3. Copy `.env.example` to `.env` and fill in your project URL and anon key
   (Project Settings -> API).
4. Restart the dev server.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Move selection (NAV mode) |
| SPACE | Select / tick checkbox |
| ENTER | Confirm / continue |
| BACKSPACE | Go back (on an empty text field, asks first) |

The status bar shows the current input mode: `◆ NAV` for menu navigation,
`▮ TXT` for free-text entry. On phones the same flow runs with tap targets
and on-screen BACK/ENTER buttons.

## Building

```bash
npm run build   # type-checks and outputs static site to dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

## Structure

- `src/App.tsx` — screen flow state machine (welcome -> status -> contact -> history -> skills -> transmission)
- `src/components/screens/` — the six screen types (info, single choice, multi choice, text, skills picker, thanks)
- `src/data/skills.ts` — starting skill taxonomy; visitor-added skills are stored in `skill_options` and merged in for later visitors
- `src/data/locations.ts` — 15 preset countries (Scandi + main Europe + Israel + USA) with top-5 cities; visitor-added locations go to `location_options`
- `src/data/copy.ts` — all terminal copy
- `supabase/schema.sql` — database schema + RLS policies
