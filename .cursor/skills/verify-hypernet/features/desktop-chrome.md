# Desktop chrome

After onboarding, the desert shell uses a left nav pane, a top bar, and a bottom bar. There is no always-on CRT.

## Driving it

`node .cursor/skills/verify-hypernet/helpers/verify.mjs drive desktop-chrome`

- Seed `hypernet_onboarded=1` or finish the journey.
- Left pane order is SEARCH, CREATE, MANAGE, GIMMICKS.
- CREATE opens event, event horizon, and group.
- MANAGE opens Contact lists, Event horizons, and Groups.
- GIMMICKS opens Global Spam Hell, Moonwalker, and Bot Roulette.
- Top bar has Chat, Notifications, and the avatar.
- Bottom bar has Settings and Theme on the left, Chats on the right.
- Theme cycles WHITE → BLACK → POLYCHROME from `[data-theme-cycle=true]`.
- Pixel dust is a `position: fixed` child of `.app` at z-index 0. It is not inside `.crt`.
