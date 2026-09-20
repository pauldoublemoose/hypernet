# Hypernet verification map

This directory is the maintained source for verifying user-facing Hypernet behavior. Read this index, then the matching feature file.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-hypernet/helpers/verify.mjs launch` (default `http://127.0.0.1:5179`).
- Run `doctor` and require HTTP 200 plus `HYPERNET` in the body.
- Seed a local profile before `[ SIGN IN ]`. The helper does this for `welcome-signin` and `terminal-tabs`.
- Never drive an instance this run did not launch, except `scripts/e2e.mjs` which documents its own `localhost:5173` requirement.
- Do not exercise `[ ACCESS YOUR NODE ]`, LoginScreen, admin, or `/api/session` unless a feature file names that path.

## Driving conventions

- Start from a cleared `localStorage` plus the feature's seed.
- Skip the welcome typewriter with Enter, then click the named button.
- Prefer `getByRole('button', { name: ... })` and `getByRole('tab', { name: ... })`.
- Desktop viewport for chrome/icons is `1280x800`.
- Restore nothing after a read-only drive. Cleanup kills only our server pid.

## Proof and skip reporting

- Capture the click and the resulting heading/tab, not only the last screenshot.
- UI proof includes a screenshot with `HYPERNET v0.1` visible and a `layout.json` for home-pane work.
- Record the feature ID with every artifact.
- Report an unreachable path with the command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Features

- [Welcome onboarding](./welcome-onboarding.md) is the desert journey, then an empty CRT-less stage.
- [Welcome Sign In home](./welcome-signin.md) is the guest Terminal path after the journey.
- [Terminal tabs](./terminal-tabs.md) is Feed (default), then Help, Update log, and About in the status bar.
- [Desktop chrome](./desktop-chrome.md) is SEARCH → CREATE → MANAGE → GIMMICKS plus top/bottom bars.
- [Identity preview](./identity-preview.md) is hover → top-right thumbnail.
- [Finder](./finder.md) is SEARCH, ALL mutex, search, and row/thumb/page cards.
- [Signup smoke](./signup-smoke.md) is the existing `scripts/e2e.mjs` keyboard/tap signup.
