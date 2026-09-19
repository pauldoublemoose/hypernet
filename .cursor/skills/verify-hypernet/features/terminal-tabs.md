# Terminal tabs

The Terminal status bar switches Feed, Help, Update log, and About. The selected tab is the only pane in `term-body`. Sign In lands on Feed. Help is a later click.

## Sub-features

- `tab-feed` is the default after Sign In (`Hypernet feed`).
- `tab-help` shows How to use Hypernet after you click Help.
- `tab-log` shows Update log entries (`v0.1.10` on current main).
- `tab-about` shows About Hypernet.

## How to get to it (user POV)

- Sign In to Terminal. Feed is selected.
- Choose Help, Update log, or About in the bottom status bar.
- Keyboard Backspace/Escape leaves Terminal. It does not change tabs.

## Driving it with verify.mjs

Preconditions:

- Doctor is green.
- A seeded profile is in place (the helper seeds on this drive).

- **Open home.** Run `node .cursor/skills/verify-hypernet/helpers/verify.mjs drive terminal-tabs`. After Sign In, tab `Feed` is selected and the heading is `Hypernet feed`.
- **Help.** The helper clicks tab `Help`. The heading becomes `How to use Hypernet`.
- **Update log.** The helper clicks tab `Update log`. The heading becomes `Update log` and `v0.1.10` is visible.
- **About.** The helper clicks tab `About`. The heading becomes `About Hypernet`.
- **Proof.** Screenshots `terminal-tabs-help.png`, `terminal-tabs-log.png`, and `terminal-tabs-about.png` sit under `/tmp/hypernet-verify/evidence/`.

## Gotchas

- Tabs live in `.term-status` via `statusCenter`, not in the page header.
- While tabs are mounted, the `[GRAPH]` header button is hidden. Graph is the desktop Network Graph icon.
- Do not treat Global Announcements as a Terminal tab. That is a left-dock screen.
