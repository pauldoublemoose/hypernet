---
name: verify-hypernet
description: Drive the Hypernet CRT web UI the way a user does (Vite + Playwright). Use to launch, doctor, click-path Sign In / Terminal / desktop chrome, capture evidence, and tear down only the instance this run started.
---

# Verify Hypernet

Primary surface is the Vite React CRT terminal at a local URL. Auth/session/OTP/admin/cookie paths are out of scope for this skill unless a feature file names them.

## Launch

From the repo root:

```bash
node .cursor/skills/verify-hypernet/helpers/verify.mjs launch
```

This starts `node_modules/.bin/vite --host 127.0.0.1 --port <PORT> --strictPort` with `PORT` from `VERIFY_PORT` (default `5179`). Ready when `GET http://127.0.0.1:<PORT>/` returns 200 and the HTML includes `HYPERNET`. State is written to `/tmp/hypernet-verify-run.json` (`pid`, `port`, `startedByUs`). Spawn Vite directly so cleanup can kill that pid. Do not record the `npm` wrapper.

If that file already names a live pid on the same port, launch is a no-op.

Teardown is `cleanup` below. Do not `pkill` vite or node.

## Doctor

```bash
node .cursor/skills/verify-hypernet/helpers/verify.mjs doctor
```

Read-only. Pass when all of these hold:

- `/tmp/hypernet-verify-run.json` exists and `port` answers HTTP 200
- response body contains `HYPERNET`
- `import('playwright')` resolves

Refuse to drive if doctor fails. A shared `npm run dev` on 5173 is not this instance; launch your own port.

## Drive

Harness is Playwright Chromium via the helper (same stack as `scripts/e2e.mjs`). Prefer button names and `role=tab` over coordinates.

```bash
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive welcome-onboarding
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive welcome-signin
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive terminal-tabs
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive desktop-chrome
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive identity-preview
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive finder
```

Signup smoke uses the repo script, not this helper:

```bash
# requires a server on http://localhost:5173
node scripts/e2e.mjs
```

Read `features/README.md` then the matching feature file before a drive. Use that file's literals and flags.

`[ SIGN IN ]` on Welcome is the guest home path (`go('terminal')`). It needs a seeded local profile (`hypernet_profile`). It is not `[ ACCESS YOUR NODE ]` / LoginScreen. Do not open login, OTP, admin, or `/api/session` for Terminal-home work.

## Evidence

Proof artifacts land in `/tmp/hypernet-verify/evidence/` and stay after cleanup.

Standards:

- Drive the real welcome click path. Do not `setScreen` or hit test-only routes.
- Capture the action and the resulting state (heading, selected tab, screenshot, layout JSON).
- Layout proof is measured boxes on `.chrome-frame`, `.term-header`, `.term-body`, `.term-status` vs the viewport, not a visual guess.
- Pass `--fill-viewport` only after the home pane is specified to fill under the header to the footer. Current main is a short card; the baseline drive records geometry and does not require fill.

## Cleanup

```bash
node .cursor/skills/verify-hypernet/helpers/verify.mjs cleanup
```

Kills only the `pid` in `/tmp/hypernet-verify-run.json` when `startedByUs` is true. Removes the state file. Leaves `/tmp/hypernet-verify/evidence/` in place.

## Helpers

```bash
node .cursor/skills/verify-hypernet/helpers/verify.mjs launch
node .cursor/skills/verify-hypernet/helpers/verify.mjs doctor
node .cursor/skills/verify-hypernet/helpers/verify.mjs drive <feature-id> [--heading "..."] [--fill-viewport] [--expect-scroll]
node .cursor/skills/verify-hypernet/helpers/verify.mjs cleanup
```
