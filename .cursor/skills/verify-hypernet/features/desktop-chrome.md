# Desktop chrome

On a wide pointer desktop, discovery and mine icon columns sit beside the CRT frame. The frame stays a chrome bezel with header and status footer.

## Sub-features

- `dock-left` shows Global Announcements, Global Chat, Network Graph, and the Find column.
- `dock-right` shows inbox and mine icons plus Theme / Admin / SETTINGS.
- `theme-cycle` cycles WHITE → BLACK → POLYCHROME from the Theme icon.

## How to get to it (user POV)

- Load the app at a desktop viewport (`1280x800`). Icons are beside the window.
- A coarse/narrow viewport hides the docks. Theme then lives on the header `[WHITE]` control.

## Driving it with verify.mjs

Preconditions:

- Doctor is green.
- Viewport is `1280x800`.

- **Docks visible.** Run `node .cursor/skills/verify-hypernet/helpers/verify.mjs drive desktop-chrome`. Left nav `Hypernet discovery` and right nav `Hypernet mine` are visible. `Global Announcements` and `SETTINGS` labels are visible.
- **Theme cycle.** Click the control with `data-theme-cycle="true"`. `.app` `data-theme` becomes `black`, then `polychrome`, then `white`.
- **Proof.** Screenshot `desktop-chrome.png` shows both docks and `HYPERNET v0.1`.

## Gotchas

- Mobile and coarse-pointer media queries hide `.desktop-icons`. Do not fail a mobile run for missing docks.
- Theme on desktop is the right-column icon, not the header button (header theme is `.mobile-only`).
