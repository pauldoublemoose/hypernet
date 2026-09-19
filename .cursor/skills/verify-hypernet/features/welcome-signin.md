# Welcome Sign In home

Sign In from Welcome opens the Terminal home. A returning device with a saved local profile can enter. A device with no profile is told to Sign Up.

## Sub-features

- `signin-gate` blocks Sign In when `hypernet_profile` has no identity fields.
- `signin-open` opens Terminal home after a seeded profile and `[ SIGN IN ]`.
- `signin-default-tab` shows the default Terminal tab (Help on current main).
- `signin-chrome` keeps the CRT header and status footer around the pane.

## How to get to it (user POV)

- On Welcome, finish the typewriter, then choose `[ SIGN IN ]`.
- After leaving Terminal, choose the header section badge `[ T :: TERMINAL ]` to reopen the same home.

## Driving it with verify.mjs

Preconditions:

- Doctor is green at the launched URL.
- Feature uses a seeded profile (`displayName` set).
- Do not click `[ ACCESS YOUR NODE ]`.

- **Skip intro.** Press Enter until `[ SIGN IN ]` is visible. The helper presses Enter once after `HYPERNET v0.1`.
- **Seeded Sign In.** Run `node .cursor/skills/verify-hypernet/helpers/verify.mjs drive welcome-signin --heading "How to use Hypernet"`. The page shows heading `How to use Hypernet` and selected tab `Help`.
- **Empty-profile gate.** Clear storage, skip seed, click `[ SIGN IN ]`. The page stays on Welcome and shows `No account on this device yet — use Sign Up`.
- **Proof.** Artifacts `welcome-signin.png` and `welcome-signin.layout.json` exist under `/tmp/hypernet-verify/evidence/`. The screenshot shows `HYPERNET v0.1` and the heading. The JSON records `.chrome-frame`, `.term-body`, and `.term-status` boxes versus the viewport.

After the home pane is specified to fill the viewport, add `--fill-viewport` (and `--expect-scroll` when the feed overflows). Do not pass those flags on current main. The short card is the baseline.

## Gotchas

- `[ SIGN IN ]` is not login. Login is `[ ACCESS YOUR NODE ]`.
- Sign In without a profile never reaches Terminal. Seed first.
- The typewriter swallows the first Enter. Wait for the Sign In button before asserting home.
- Header badge reopen is a second entry point. Prove it only after Sign In has already landed on Terminal.
