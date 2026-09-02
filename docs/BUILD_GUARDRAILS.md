# Hypernet — Build Guardrails

Written for coding agents and humans building Hypernet. Adapted from production multi-client lessons (web + desktop + mobile, one backend), tuned to **our** stack and roadmap. Nothing here invents a second platform before we need it — it stops us paying for that mistake twice later.

**Related product docs:** [`PROJECT_PLAN.md`](./PROJECT_PLAN.md), [`USER_STORIES.md`](./USER_STORIES.md).

**Working branch:** `cursor/sebs-experimental-branch` (not `main`).

---

## 1. The one decision everything else follows from

**Share everything below the component layer. Fork the UI.**

There is no universal button that renders correctly on web, a future desktop shell, and a future native phone app. There *is* a universal definition of what the control means: label, disabled rules, colors/tokens, validation, and domain behavior — with thin platform-specific renderers when we have more than one client.

| Layer | Shared? | Why |
|---|---|---|
| Database schema, RLS, Edge Functions | one copy | One Supabase backend; every client is just a client |
| Row transforms (DB ↔ app shapes) | shared module/package when extracted | One mapping, not three |
| Domain / presentation view-models (Horizon status labels, role names, graph summaries, one-liners) | shared | Product wording stays consistent |
| Auth hand-off URL builder/parser | shared early | Same callback semantics wherever we sign in |
| Copy strings (terminology one-liners from the project plan) | shared | “Node”, “Horizon”, “Chronicle”, “Group” never drift |
| Design tokens + fonts (light / dark / polychrome; role colors) | shared | Brand lives once |
| Components / screens / navigation | **per client** | DOM vs native primitives are different; even responsive web vs a Win95-style desktop shell can diverge honestly |
| Platform capability (fs, notifications, window chrome) | app-owned, injected | Shared modules never import `window` / Node / Electron / RN APIs |

**Payoff:** A product decision (“Admin role is polychrome”; “Interested only hits the personal default Horizon”) changes in one place and stays true everywhere.

**Trap this avoids:** A “cross-platform UI kit” full of `if (platform === …)` that nobody can safely change. Shared *logic* has no platform tax; shared *views* usually do.

---

## 2. Design source of truth (Hypernet-specific)

Sharing code does not stop divergence — divergence comes from **inventing UI on the second surface**.

**Rule:**

> The **desktop web shell** (Win95-like desktop with features as icons; full-viewport layouts over cramped CRT panes) is the design source of truth for every surface phone mirrors.
> Phone adapts those decisions (single-window / responsive layouts are fine and may be temporary). Phone does **not** invent new presentation unless product asks first.

**Litmus test (use this in reviews):**

> Point at the desktop element it mirrors (file + rough location). No desktop counterpart → it’s an invention; leave it out or raise it as a product question.

Classify every element on a mirrored surface into exactly one bucket:

- **Shared** — from a shared module (tokens, copy, view-models). Missing decision? Add it to the shared layer so desktop gets it too; never hardcode only on phone.
- **Adapted** — platform / form-factor best practice, not invention: safe areas, tap targets, stacked navigation, single-window phone chrome.
- **Copied verbatim** — SVG paths, a few raw values not yet tokens. Name the desktop source; keep honest that they are copies.

For an agent: “make the phone version” is a **lookup**, not an open design task.

**Also non-negotiable from the project plan:**

- Graph is brand, not always home.
- Streamlined UI — use the screen; pre-alpha CRT signup is temporary.
- Retro-futuristic + high-end sleek; light / dark / polychrome.
- Public by default; privacy toggles obvious.
- Fast path to value; explain Hypernet terms with the official one-liners.

Do **not** introduce new visual patterns until the core screens in `PROJECT_PLAN.md` §8 feel consistent. Prefer extending `TerminalFrame`, theme tokens, and existing chrome over new shells.

---

## 3. What we have today vs what we are not building yet

### Today (truth)

- **Stack:** Vite + React + Supabase (already in repo).
- **Clients:** One primary web app. Desktop and phone are the **same web product** with different layouts until product green-lights native shells.
- **MVP north star:** Discover an event worth going to — typically via groups and horizons.
- **Phases:** Identity & profiles → events/groups/horizons/chronicle → discovery → privacy/polish. See `PROJECT_PLAN.md`.

### Not yet (unless PM + Sebastian explicitly prioritize)

- Electron (or other) **installed desktop app**
- Expo / React Native **native mobile app**
- A full **pnpm monorepo** with `apps/web`, `apps/desktop`, `apps/mobile`

React Native (when/if we need it) buys shared **language and domain logic** with the web team — **not** one UI codebase. Electron remains the cheap path for a real desktop app while the renderer is still a React web app. Until then: **do not** scaffold those apps “just in case.”

---

## 4. Extract shared layers *before* a second client exists

This is the step people skip and regret. Do it while there is still one caller.

When touching a feature area, prefer pulling these out of screen components into clear modules (folders or packages — structure can stay simple until a second app appears):

1. **Spec / validation** — shapes and rules (e.g. event fields, horizon contribution settings).
2. **Presentation / view-models** — “what the UI should say” (Horizon status: gray / B-W / polychrome; role labels; graph tooltip text).
3. **Copy** — terminology one-liners and first-touch explanations.
4. **Theme tokens** — primitives → semantic tokens → recipes; light / dark / polychrome; role colors (`Guest`, `Co-creator`, `Sponsor`, `Admin`).
5. **Auth hand-off** — one callback URL design, parser tested once (magic link / OAuth — product decision still open).

**Rules for anything meant to stay universal later:**

- No DOM globals, no `node:` imports, no Electron/RN imports inside shared modules.
- Platform access is **injected** by the app (providers / adapters).
- Avoid bundler-only tricks in shared modules (`import.meta.env`, `?raw`, etc.) if those modules must someday load under Metro — or isolate them behind a clearly marked web-only module.

Write a short **tier list** when a second client appears: every shared module is universal unless listed as web-only / Node-only.

---

## 5. Suggested layout when (if) we go multi-client

Start from this shape — **do not create empty apps early**:

```
apps/
  web/                 # marketing / public site if split (SEO, static)
  app/ or desktop/     # main product UI (Vite React); Electron wraps this later if needed
  mobile/              # Expo + RN only when product commits
packages/ (or src/shared/ while still one app)
  *-spec/              # schema + validation
  *-presentation/      # view-models
  db-transforms/
  ui-copy/
  theme/               # tokens + fonts
  auth-handoff/
  date-utils/
supabase/              # schema, migrations, functions — one backend
docs/
  PROJECT_PLAN.md
  USER_STORIES.md
  BUILD_GUARDRAILS.md  # this file
```

**Docs agents should load before tasks:**

- Root `AGENTS.md` (when added) — workspace map, verification commands, naming traps.
- This file — sharing rules + design SoT + “not yet” platforms.
- `PROJECT_PLAN.md` / `USER_STORIES.md` — product truth.

Keep agent docs as **constraint lists + pointers**, not essays. Test for each line: *would an agent make a wrong edit without it?*

---

## 6. Suggested order of work (Hypernet)

Aligned with the project plan; still no construction without PM green-light.

1. **Finish shared domain extraction from the existing Vite app** while we only have one client — tokens, copy, view-models, validation around profiles / groups / horizons / events.
2. **Phase 1 — Identity & profiles** on web: auth, redesigned onboarding (full viewport), profile CRUD, default Horizon, skill search, privacy v1, discovery-biased home.
3. **Phase 2 — Events, groups, horizons, chronicle** on the same web client; keep graph as its own view; link topology for large events is a product decision (avoid all-to-all).
4. **Only then** consider Electron if an installed desktop app is required — reuse the web renderer; force deep-link + session model early in that step.
5. **Only then** consider Expo — mirror one thin surface end-to-end first (auth is ideal); keep mobile a thin client (live queries + RLS) until product demands offline/realtime complexity.

**Do not** start with native mobile or a second UI framework mid–Phase 1.

---

## 7. Core screens (do not invent new ones lightly)

From the project plan — every other screen is a variation:

1. Landing / home
2. Group directory
3. Profile (view/edit)
4. Group (view)
5. Graph (full, dedicated)
6. Event (view/create)
7. Horizon (view/create)

Before a UI PR merges: walk signup → group directory → group → horizon → interested/going → profile on **desktop and phone** in under ~2 minutes. Flag clutter. Confirm new UI uses official one-liners.

---

## 8. Five things that will bite (in advance)

1. **Design drift on the second surface** — A “helpful” phone-only badge with no desktop twin gets reported as a bug. Fix: litmus test in §2, in writing, in every mobile/responsive review.
2. **Logic stuck inside components** — When a second client arrives, you rewrite product rules. Fix: extract view-models/copy/tokens while still one app.
3. **Graph edge explosion** — All-to-all links for large events are not workable. Fix: ship nodes + interaction; decide topology with product before scale (hub / co-creators / filters).
4. **Auth hand-off retrofitted late** — Miserable across clients. Fix: design one callback shape when auth lands in Phase 1.
5. **Whole-repo CI / agent thrash** — Prefer scoped checks for the files you touched; document the smallest useful verify commands in agent docs when they exist.

---

## 9. The short version

- One backend (Supabase), one product language (React), one repo.
- **Share** logic, view-models, copy, and tokens; **fork** views per client.
- **Desktop web shell** is the design source of truth; phone adapts or asks product.
- Extract shared layers **before** Electron/Expo exist.
- Do **not** scaffold native mobile or Electron until PM + Sebastian prioritize them.
- Follow `PROJECT_PLAN.md` phases; Graph topology and auth method stay product-owned open questions.

---

*Source inspiration: Torsten Rüter’s multi-client production notes (Aug 2026), adapted for Hypernet. Last updated: Sep 2026.*
