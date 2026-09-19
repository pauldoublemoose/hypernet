# Signup smoke

The repo keyboard and mobile signup flows still complete offline and cache one pending signup.

## Sub-features

- `signup-desktop` walks Known Co-creator signup on a 1280x800 keyboard.
- `signup-mobile` walks Subscriber signup on a 390x844 tap viewport.

## How to get to it (user POV)

- From Welcome, choose `[ SIGN UP ]` and complete the form to transmission.

## Driving it with e2e.mjs

Preconditions:

- A Vite server is listening on `http://localhost:5173/` (`npm run dev` with default port).
- Playwright Chromium is installed.
- This feature is optional for Terminal-home work. Run it when cheap.

- **Smoke.** Run `node scripts/e2e.mjs`. Stdout includes `desktop flow: OK`, `mobile flow: OK`, and `ALL E2E CHECKS PASSED`. Exit code is 0.
- **Writes blocked.** The script stubs non-GET `/rest/v1/**` with 503. Do not point it at a live database without that stub.
- **Proof.** Exit code 0 and the log lines above. Screenshots under `scripts/shots/` are extra, not required for Terminal-home.

Auth cookie checks are `scripts/e2e-auth.mjs`. Do not run them for Terminal-home work.

## Gotchas

- `e2e.mjs` hard-codes port 5173. The verify helper default is 5179. Either launch Vite on 5173 or skip this feature.
- Thanks remount is `scripts/e2e-thanks-remount.mjs`. Out of scope unless that bug is in play.
