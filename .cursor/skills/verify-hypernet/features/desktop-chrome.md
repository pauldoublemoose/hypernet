# Desktop chrome

After onboarding, the desert shell uses a left nav pane, a top bar, and a bottom bar. There is no always-on CRT.

## Driving it

`node .cursor/skills/verify-hypernet/helpers/verify.mjs drive desktop-chrome`

- Seed `hypernet_onboarded=1` or finish the journey.
- Left pane order is FEED, SEARCH, CREATE, MANAGE, GIMMICKS.
- Body and left pane use IBM Plex Mono (`document.fonts.check` plus computed `font-family`).
- FEED opens `F :: FEED` with burns-seeded events.
- CREATE event, event horizon, group, and call out open `E :: EVENTS`, `H :: HORIZONS`, `CL :: CLUSTERS`, and `CO :: CALL OUT`.
- MANAGE Contact lists, Event horizons, and Groups open `C :: CONTACTS`, `MH :: MY HORIZONS`, and `CL :: MY CLUSTERS`.
- GIMMICKS opens Global Spam Hell, Moonwalker, Bot Roulette, and Mystery Chat. Global Spam Hell shows that heading. Moonwalker shows `MOONWALKER`. Bot Roulette spins. Mystery Chat joins the pool, matches an alias, and never shows a directory name.
- Top bar has Chat, Notifications, and the avatar.
- Bottom bar has Settings and Theme on the left, Chats on the right.
- Theme cycles WHITE → BLACK → POLYCHROME from `[data-theme-cycle=true]`.
- Pixel dust is a `position: fixed` child of `.app` at z-index 0. It is not inside `.crt`.
