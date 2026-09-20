# Desktop chrome

After onboarding, the desert shell uses a left nav pane and a top bar. There is no always-on CRT and no bottom bar on the main window.

## Driving it

`node .cursor/skills/verify-hypernet/helpers/verify.mjs drive desktop-chrome`

- Seed `hypernet_onboarded=1` or finish the journey.
- Left pane order is FEED, SEARCH, CREATE, MANAGE, GIMMICKS.
- Body and left pane use IBM Plex Mono (`document.fonts.check` plus computed `font-family`).
- FEED opens `F :: FEED` with burns-seeded events. Header stays put; Mast scrolls away. Rows | Thumbnails.
- SEARCH uses the same Header · Mast · Feed anatomy. Header stays put; Mast (filters + search + Rows/Thumbnails) scrolls away.
- CREATE event opens the Create event sheet (`[data-shell=create-event]`): cover, host, name, start date/time/timezone, Find Me, Create event CTA.
- CREATE event horizon still opens `H :: HORIZONS`.
- CREATE group opens the Create group sheet (`[data-shell=create-group]`): cover, admin, name, about, privacy, optional location, Find Me, Create group CTA. Not datetime-first.
- CREATE call out opens `CO :: CALL OUT`.
- MANAGE Contact lists, Event horizons, and Groups open `C :: CONTACTS`, `MH :: MY HORIZONS`, and `CL :: MY CLUSTERS`.
- GIMMICKS opens Global Spam Hell, Moonwalker, Bot Roulette, and Mystery Chat. Global Spam Hell shows that heading. Moonwalker shows `MOONWALKER`. Bot Roulette spins. Mystery Chat joins the pool, matches an alias, and never shows a directory name.
- Top bar has Settings, Theme, Chat, Notifications, and the avatar.
- Theme cycles WHITE → BLACK → POLYCHROME from `[data-theme-cycle=true]`.
- Pixel dust is a `position: fixed` child of `.app` at z-index 0. It is not inside `.crt`.
