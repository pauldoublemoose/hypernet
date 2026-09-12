# Hypernet — Project Plan

---

## 1. Product Summary

**Hypernet** is a social platform for the participatory event community — Burning Man camps, ravers, indie artists, and co-creators who build experiences together.

It is **not** a consumption feed like Facebook. It is a **recruitment and discovery tool**:

- Find people with the right skills before a burn or between seasons.
- Share events and horizons across the broader community (not just your friend group).
- Visualize the community as an interactive **network graph** — the core brand experience. The graph is an **ego-centric 2D explorer** (your node as avatar; drop into a World), not one global helicopter map.

**MVP north star:** The first useful moment is discovering an event you want to go to — typically by browsing **groups** and their **horizons**, then saving or marking attendance.

**Key terminology**


| Term          | Meaning                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node**      | A person in the network (their profile). Used during onboarding: *"Create your node."*                                                                                                                                        |
| **Profile**   | A person's page — avatar, bio, skills, Chronicle. Synonymous with *node* in user-facing copy.                                                                                                                                 |
| **Cluster**   | An organization or collective (e.g. a camp, crew, label). Has admins **and members**, its own page, hosted events, and horizons. User-facing name is Cluster (never “group”).                                              |
| **Link**      | A connection between two nodes on the graph. MVP draws **one shared-event layer** inside the selected World (see §7.4). Avoid all-to-all edges for big events.                                                                 |
| **World**     | A domain you drop into on the graph — often an **event twin**. Later: Cluster / city / neighborhood as Worlds (open). Privacy = reach.                                                                                          |
| **Chronicle** | A profile section listing events a person has participated in, with their role. Built from “going” attendance after the event date, or manual past entries.                                                                    |
| **Horizon**   | A publishable, subscribable collection of events (like a playlist/calendar). Owned by a profile or group. Multiple admins; contribution setting: *Admins only* or *Open*. Every profile also gets a **private default Horizon** (personal “liked / starred” list). |
| **Interested / Going** | Two ways to save an event: *Interested* adds it only to your default Horizon; *Going* asks for role (guest, co-creator, etc.) and later feeds Chronicle after the event. |


**User-facing one-liners** *(use consistently wherever the term first appears)*


| Term          | Explain it as…                                                    |
| ------------- | ----------------------------------------------------------------- |
| **Node**      | You in the network.                                               |
| **Horizon**   | A shared calendar — create one, add events, let others subscribe. |
| **Chronicle** | Your event history — what you've joined and the role you played. Full My Chronicle = personal event history + roles + unconfirmed (Interested, past Horizons). |
| **Cluster**   | A camp, crew, or collective — run by people, with its own page.   |
| **World**     | A place you drop into on the graph — often an event twin.         |


**Profile vs. Cluster vs. contact list**

- A **profile** represents a person; a **cluster** represents an organization. Both can publish events and horizons.
- A **contact list** is a private, user-defined list of people for invites and visibility — not the same as a cluster. Lists stay secret; clusters are shared.
- **Cluster members** belong to the camp/collective; **cluster admins** manage the page. Distinct from contact lists. Never nest lists inside Clusters UI.
- A **World** is a graph domain (often an event twin), not a Cluster. Do not label the primary graph control “Cluster by” (noun collision). Prefer **Arrange by** only if a layout mode returns later.

**Horizon status indicators** *(group directory and similar lists; colors invert with light/dark theme)*


| Indicator              | Meaning                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| Grayed out             | Group has no public/subscribable Horizon                                 |
| High-contrast (B/W)    | Group has a Horizon, no upcoming (future-dated) events                   |
| Polychrome             | Group has a Horizon with at least one upcoming event                     |

---

## 2. Problems We Are Solving


| Problem                  | Today                                                                       | Hypernet solution                                             | Priority  |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------- | --------- |
| **Camp recruitment**     | Word of mouth within friend groups; hard to find talent outside your circle | Group pages + searchable skills + profile discovery via graph | Essential |
| **Event discovery**      | Events shared only in private networks                                      | Public/subscribable horizons + searchable event database      | Essential |
| **Community visibility** | No shared record of who built what                                          | Chronicle on profiles; graph links show co-participation      | Essential |
| **Creator economics**    | High ticket fees (e.g. Billetto ~10%)                                       | Lower-cost ticketing                                          | Future    |


---

## 3. Design Principles (Non-Negotiable)

These apply from **Phase 1 onward**, not as a late polish pass.

1. **Graph as brand, not always as home** — The interactive graph is a core brand experience, not necessarily the post-login home screen. Home may use an artistic / reduced graphic; discovery of groups and events comes first. The graph itself is **ego-centric**: drop into a World and mingle locally — **not** one global helicopter view of everyone.
2. **Streamlined UI — use the screen** — Intelligent layout, minimal clutter. The pre-alpha CRT signup (small windows, wasted real estate) is a temporary MVP shell and will be **radically reworked** for real onboarding — reclaim screen space.
3. **Retro-futuristic aesthetic mixed with high-end sleek design** — CRT lines, monospace fonts, white and black plus chrome/silver accents and rainbow/polychrome highlights. Three theme modes (see §7).
4. **User-controlled visibility** — Defaults are **public**; privacy toggles must be obvious. Profile and group fields, events, and connections remain under user control.
5. **Fast path to value** — Signup creates a node in seconds; profile details are filled in later. First win: find an event worth going to.
6. **Explain the language** — Hypernet uses its own terms. Where one isn't obvious, show a brief inline explanation at the point of use — the same wording sitewide, never a wall of jargon. Onboarding introduces concepts only when the user reaches them.

---

## 4. Feature Tiers

### 4.1 MVP (Must Have — Phase 1–2)

**Skill search vs. skills taxonomy:** MVP ships **free-text skill search** (camp recruitment depends on it). Structured **skills taxonomy** — browseable tags clustered from user input — comes in Core Growth once enough profiles exist.


| Feature                   | Description                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast signup**           | Minimal fields to create a node. Pre-alpha CRT flow is replaced by a redesigned onboarding that uses screen space properly.                                              |
| **Profile page**          | Avatar, short bio, skills/interests (free text for now). Public by default; obvious privacy toggles. Contact via external channels in MVP (email/Discord etc. on profile). |
| **Group page**            | Camp/collective: name, image, description, **members** + admins. Join policy: open by default; later *admin approval* / *member approval*.                             |
| **Group directory**       | Browseable list/table of all groups: member count; Horizon status icon (gray / B-W / polychrome for upcoming).                                                          |
| **Basic event creation**  | Title, date, description, visibility. Hosted by profile or group. External ticket URL OK. One event may sit on **multiple Horizons**.                                  |
| **Interested / Going**    | Simple save to personal default Horizon (*interested*). *Going* selects role; after event date → Chronicle.                                                            |
| **Personal default Horizon** | Every profile gets one private “liked/starred” Horizon at signup. One-click add; separate control to add to Horizons you manage.                                    |
| **Event database**        | Events stored persistently; past events can be added to Chronicle (self-declared in early MVP; admin confirmation soon after).                                         |
| **Event roles**           | Guest, Co-creator, Sponsor, Admin — color-coded (see §7.2).                                                                                                            |
| **Network graph v1**      | Ego-centric 2D World explorer (not a global helicopter force graph). World picker + local avatar + click→profile + one shared-event link layer + simple visibility/dim. See §7.4. |
| **Graph filters**         | MVP: World cards first; in-world Gravity + Visibility (simple cycle) + one shared-event Links toggle. Multi-layer dropdown farm and Gravity designer stay parked.     |
| **Skill search**          | Find people by free-text match on profile skills. Essential for camp recruitment.                                                                                      |
| **Horizons**              | Profiles and groups publish horizons. Multiple horizon admins. Contribution setting: admins only or open.                                                              |
| **Horizon subscriptions** | Subscribe; **in-app** notify when a new event is added (email later).                                                                                                  |
| **Theme system**          | Light, Dark, and Polychrome modes.                                                                                                                                     |
| **Basic privacy**         | Public by default; per-section Public / Private with highly visible toggles. Friends-only / custom lists in Core Growth.                                               |
| **Contextual copy**       | One-line explanations at first touch (see terminology one-liners). Progressive onboarding.                                                                             |


### 4.2 Core Growth (Should Have — Phase 3–4)


| Feature               | Description                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Contact lists**     | User-defined lists of profiles (e.g. "Camp crew", "Sound team") for targeted event invites — distinct from groups. |
| **Granular privacy**  | Public / Friends-only / Private / Custom list visibility per field or section.                                     |
| **Skills taxonomy**   | Structured, browseable tags derived from accumulated free-text skills (data-driven — not in MVP).                  |
| **Event invitations** | Invite contact lists to events.                                                                                    |
| **Group join policies** | Toggle: anyone can join / admin approval / approval by another member.                                           |
| **Chronicle verification** | Event admins confirm participation (beyond early self-declared Chronicle).                                    |
| **Email notifications** | Horizon subscription alerts and similar via email.                                                              |


### 4.3 Future (Nice to Have — Phase 5+)


| Feature                           | Description                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **In-app messaging**              | Contact people without leaving Hypernet.                                                                     |
| **AI profile generation**         | 2–3 onboarding questions → AI-written profile blurb. Reference: [Retribalise](https://retribalise.com) approach. |
| **Tiered event media access**     | Role-based access to photos, videos, recordings post-event (Patreon-like; links OK, hosting optional).           |
| **Profile & event customization** | MySpace-style creative expression (custom layouts, etc.).                                                        |
| **Profile music**                 | Spotify Premium / SoundCloud integration with native Hypernet player (no ugly embeds, no 30s preview limit).     |
| **Ticketing**                     | Community-friendly ticket sales with lower fees than incumbents.                                                 |
| **Polychrome highlight node**     | Special visual treatment for first node / creation moment — rainbow explosion on signup.                         |


---

## 5. Phased Roadmap

### Phase 0 — Pre-Alpha *(Done)*

- [x] CRT terminal signup flow
- [x] Supabase schema for signups, skills, locations
- [x] Network graph prototype (`NetworkGraph.tsx`)
- [x] Theme switching: light / dark / polychrome (`PolychromeFX.tsx`, `ui.tsx`)
- [x] Chrome frame UI shell (`TerminalFrame.tsx`)

### Phase 1 — Identity & Profiles *(4–6 weeks)*

**Goal:** A user can sign up, edit a profile, browse groups, and appear as a node on the graph.


| Task                             | Notes                                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| Auth (email magic link or OAuth) | Replace anonymous signup insert with authenticated users            |
| User ↔ signup migration          | Map existing `signups` rows to `users` / `profiles`                 |
| Redesigned onboarding            | Replace cramped CRT signup flow; full-viewport layouts              |
| Profile CRUD API                 | Avatar upload, bio, skills (free text), location, contact fields    |
| Profile page UI                  | Public by default; obvious privacy toggles; mobile-friendly         |
| Personal default Horizon         | Auto-create private “liked” Horizon at signup                       |
| Skill search (free text)         | Full-text match on profile skills; public profiles only             |
| Landing / home                   | Bias to discovery (groups/events); optional artistic graph motif (not the full World explorer) |
| Contextual copy & onboarding     | One-liner per concept at first touch; progressive, not front-loaded |
| Privacy v1                       | Public default; Public / Private per profile section                |


**Exit criteria:** New user signs up → gets default Horizon → edits profile → finds a group in the directory → appears on graph.

### Phase 2 — Events, Groups, Horizons & Chronicle *(4–6 weeks)*

**Goal:** Browse camps, join groups, follow horizons, save/attend events, build Chronicles.


| Task                       | Notes                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Groups schema              | name, description, avatar, visibility; `group_admins` + `group_members`                            |
| Group join (open)          | Anyone can join in early MVP; join-policy toggles in Core Growth                                   |
| Group directory            | Table/list: member count; Horizon status icon (gray / B-W / polychrome)                            |
| Group page UI              | Public group profile; members list; admin edit mode                                                |
| Events schema              | host = profile or group; events may belong to **many** horizons                                    |
| Interested / Going         | Interested → default Horizon only; Going → pick role; post-event → Chronicle                       |
| Event participation schema | user_id, event_id, role, status (interested \| going)                                              |
| Horizons schema            | owner (profile or group), contribution setting; personal default Horizon                          |
| Horizon admins             | Multiple profiles can curate a shared Horizon                                                      |
| Horizon ↔ events           | Add to default Horizon (one click) or to Horizons you manage                                       |
| Horizon subscriptions      | Subscribe; **in-app** notify on new event                                                          |
| Chronicle on profile       | From Going (after date) + manual past entries; early self-declare OK                               |
| Graph view                 | Dedicated screen (not home): World picker + ego-centric walk. One shared-event link layer. Avoid all-to-all for large events. See §7.4. |
| Past events                | Manual Chronicle entries allowed                                                                   |


**Exit criteria:** User browses group directory → opens camp Horizon → marks Going on an event with a role → after event date, Chronicle updates → subscriber of that Horizon saw in-app notice when event was added.

### Phase 3 — Discovery *(4–6 weeks)*

**Goal:** Community can find people and events beyond their immediate network.


| Task                | Notes                                    |
| ------------------- | ---------------------------------------- |
| Public event search | Filter by date, location, visibility     |
| Contact lists       | CRUD lists; add members; use for invites |


**Exit criteria:** User searches public events by keyword and date range.

### Phase 4 — Privacy, Invites & Polish *(3–4 weeks)*

**Goal:** Trust and polish for real-world camp use.


| Task                 | Notes                                                         |
| -------------------- | ------------------------------------------------------------- |
| Granular privacy     | Friends-only + custom list visibility                         |
| Event invitations    | Invite contact list to event                                  |
| Graph physics polish | Parked as helicopter/force polish. Explorer uses local walk + loose camera; Gravity designer later. |
| Skills taxonomy v1   | Cluster free-text skills into browseable tags; enhance search |
| Performance          | Graph rendering with 100+ nodes                               |


**Exit criteria:** Camp admin invites "Sound team" list to event; only invited members see private event details.

### Phase 5+ — Future Backlog

Prioritize based on user feedback after Phase 4 launch.

- AI profile generation
- Tiered post-event media access
- Profile/event page customization (MySpace-style)
- Spotify / SoundCloud profile music
- Native ticketing

---

## 6. Data Model (High-Level)

```
users
  └── profiles (avatar, bio, skills[], location, contact_fields, privacy_settings)
  └── contact_lists
        └── contact_list_members
  └── personal_default_horizon_id  (private liked/starred Horizon)

groups
  └── name, description, avatar, visibility
  └── join_policy (open | admin_approval | member_approval)  -- open in early MVP
  └── group_admins (profile_id, group_id)
  └── group_members (profile_id, group_id)

events
  └── host_type (profile | group), host_id
  └── event_participants (user_id, role, status: interested | going)
  └── visibility, external_url, dates, description

horizons
  └── owner_type (profile | group), owner_id
  └── is_personal_default (bool)  -- private; one per profile
  └── name, description, visibility
  └── contribution_setting (admins_only | open)
  └── horizon_admins (profile_id, horizon_id)
  └── horizon_events (horizon_id, event_id)  -- many-to-many: event on many horizons
  └── horizon_subscriptions (user_id, horizon_id)

graph_worlds (event twins — see §7.4)
  └── kind: open/community | private
  └── private surf dial: participants | friends_of_participants (default) | anyone
  └── dual privacy: event surf ≠ personal Chronicle / “I attended” privacy

graph_links (derived — one shared-event layer in MVP)
  └── edges among people who share the selected World/event
  └── no edges out of dim/locked nodes; proximity can light links
  └── avoid all-to-all guest cliques at large-event scale
  └── FoF × co-attendee edge matrix inside a world: open later
```

Existing `signups`, `skill_options`, and `location_options` tables from pre-alpha should be migrated, not discarded.

---

## 7. Visual Design System

### 7.1 Theme Modes


| Mode           | Base                | Accents                     | Usage                                        |
| -------------- | ------------------- | --------------------------- | -------------------------------------------- |
| **Light**      | Black text on white | Chrome / silver             | Default                                      |
| **Dark**       | White text on black | More chrome than light mode | Night / indoor                               |
| **Polychrome** | Rainbow holographic | Animated, shiny, dynamic    | Brand moments, Admin role, easter egg toggle |


Polychrome is a **brand identity element**, not a gimmick. Use it sparingly in special locations (Admin badges, highlight node on creation, role indicators).

### 7.2 Event Role Colors

Use consistently across profiles, Chronicle, graph badges, and event pages.


| Role       | Color                | Token name (suggested) |
| ---------- | -------------------- | ---------------------- |
| Guest      | White                | `--role-guest`         |
| Co-creator | Black                | `--role-cocreator`     |
| Sponsor    | Chrome / silver      | `--role-sponsor`       |
| Admin      | Polychrome (rainbow) | `--role-admin`         |


### 7.3 Typography & Texture

- Monospace / terminal fonts (VT323 or similar — already in codebase)
- CRT scanline overlay
- Chrome frame borders (existing `TerminalFrame.tsx`, `public/chrome-concept.html`)

### 7.4 Network Graph / event-worlds *(LOCKED BRIEF — Sebastian via Research, 2026-09-12)*

**North star:** Not one global helicopter graph. **Ego-centric 2D explorer:** your node as avatar; drop into a **World** (often an event twin) and mingle locally. **Privacy = reach.**

**Placement:** Full interactive graph is a **dedicated view**, not the post-login home. Home may include an artistic / reduced graphic of the network.

#### Four-layer IA

| Layer | Meaning | MVP |
| ----- | ------- | --- |
| **1. World** | Domain to drop into (event twin; later Cluster / city / neighborhood) | World picker |
| **2. Gravity** | What pulls nodes into clumps | Park — dense designer later |
| **3. Links** | Which edge layers draw (colors; toggleable) | One shared-event layer |
| **4. Visibility** | Who appears full vs dim/locked | Simple reach / allow dim |

Do **not** call the primary control “Cluster by” (noun collision with Clusters). Prefer **Arrange by** only if a layout mode returns later.

#### Event kinds + who can surf

- **Open / community** (Borderland, BM-scale): public square; surf **irrespective of attendance**; no admin gate to enter the twin.
- **Private:** one dial — **Participants / Friends of participants (DEFAULT) / Anyone** — controls marketing visibility **and** who can surf the twin. Post-event dial change notifies participants.
- **Dual privacy:** event privacy ≠ personal Chronicle / node “I attended” privacy.

**Open community authorship:** Hypernet-seeded **and** user-addable large community events; publishable; verification badge after admin review; users may request description/changes or admin privileges.

#### Controls

| Input | Behavior |
| ----- | -------- |
| WASD / arrows | Walk the avatar |
| Mouse-thrust toward cursor | Hold on empty ground; accelerate toward pointer |
| Camera | Loosely tied to the avatar (not a free helicopter pan as the primary feel) |
| Wheel | Zoom / reach |
| Dim / locked nodes | No edges out of them |
| Edges among visible nodes | May show dimmed; proximity can light links |
| Click another node | Open / show that person’s profile |
| Self / hero node | Always **polychrome** (rainbow/CRT, match `PolychromeFX`). **Plain circle only** — slightly larger than other nodes, glowy shine like the Theme desktop control. No diamond / facets / geometry. Other nodes stay theme-normal. |

#### MVP cut

World picker as **cards** (open events + private worlds the local user is allowed into). Gravity, Visibility, and Links show **only after you enter a World**. Local avatar walk + click → profile + **one shared-event link layer** + simple Gravity / Visibility.

Stubs are OK for the private-world dial and rich data. It must feel like **“drop into a world and walk”** more than “zoom a global map.”

The **self / hero node** (your avatar) always renders **polychrome** — a **plain circle** with Theme-like glow/shine (`PolychromeFX` stops). No diamond, facets, or geometry. Other nodes stay theme-normal. Make it obviously the hero.

#### 3D — struck (LOCKED 2026-09-12)

**3D is permanently out of this product line.** Not parked. Not “later.” Ego-centric **2D** is the direction forever unless Sebastian reopens it. Do not mention 3D as a backlog item. Do not build it.

#### Park (do not build)

Multi-layer dropdown farm · Gravity designer · Arrange-by-as-primary · full million-node global view.

#### Still open (do not invent)

- Cluster / city as Worlds
- Gravity defaults
- Exact FoF × co-attendee edge matrix inside a world

#### Link scale (still valid)

All-to-all links for a 500-person event ≈ **~125,000 edges** — not workable. Draw the shared-event layer locally (visible / in-reach nodes); do not implement a complete guest clique.

| Approach | When it makes sense | Edge count (n people) |
| -------- | ------------------- | --------------------- |
| **Avoid: complete clique** | Never for large guest lists | n(n−1)/2 — explodes |
| **Shared-event, local** | Co-attendees in reach / proximity (MVP) | bounded by viewport |
| **Star / hub** | Event or group as hub; people link to hub | ~n — scalable |
| **Co-creators only** | Links among Admin / Co-creator roles, not all Guests | small |
| **User-selected filters** | Extra layers when the dropdown farm returns | controlled |


---

## 8. Where to Start Streamlining the UI

**Start now, in Phase 1** — not after features are built.

Recommended approach for a non-designer product owner working with engineers:

### Step 1: Define the core screens (wireframe in words)

Before building features, agree on these screens and what each shows:

1. **Landing / home** — Discover groups & events; optional artistic network graphic (not the full interactive graph).
2. **Group directory** — Table/list of groups: member count, Horizon status icon.
3. **Profile (view/edit)** — Avatar, bio, skills, Chronicle; obvious privacy toggles; external contact.
4. **Group (view)** — Name, image, description, members, hosted events, horizons. Join + admin controls.
5. **Graph (full)** — Dedicated World explorer. Nodes = profiles. Ego-centric walk; one shared-event link layer. See §7.4.
6. **Event (view/create)** — Title, date, host, Interested/Going, role, external link, add-to-Horizon.
7. **Horizon (view/create)** — Name, events, contribution setting, admins, subscribe (or private default).

Every other screen is a variation of these.

### Step 2: Component audit (weekly, 30 min)

With each new feature, ask:

- Does this add a **new screen** or extend an existing one?
- Can this control live in the **filter bar** instead of a new panel?
- Is this information **visible by default** or behind one click?

Document decisions in `docs/UI_DECISIONS.md` (create as needed).

### Step 3: Use the existing design system

The codebase already has:

- `TerminalFrame.tsx` — chrome shell
- `PolychromeFX.tsx` — polychrome effects
- Theme tokens in `ui.tsx` and `styles.css`

**Do not introduce new visual patterns** until the core screens feel consistent. Prefer full-viewport layouts over cramped terminal panes.

**Near-term shell (pre-alpha):** Compact CRT window stays the default, sitting on a desktop backdrop. Feature icons live on that backdrop (not inside the chrome). Desktop users can expand the window from a corner control; the expanded window leaves the left (Find) and right (mine) icon strips visible. Profile is a real page (local/stub data until auth lands). Outer Find icons are **Find Nodes / Find Events / Find Horizons / Find Clusters** (Find Nodes is the people/node search placeholder). A full Win95-style multi-window shell is deferred. Do not call them Discover.

### Step 4: Product owner review gate

Before merging any UI PR:

1. Open the app on desktop and phone.
2. Walk through: signup → group directory → group → horizon → interested/going → profile in under 2 minutes.
3. Flag anything that feels cluttered or redundant.
4. Confirm every new screen names what it is in plain language (see §1 one-liners).

This keeps you in the design loop without needing to write CSS.

---

## 9. Technical Notes for Engineers


| Area               | Recommendation                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| **Stack**          | Continue Vite + React + Supabase (already in place)                                                    |
| **Graph**          | Ego-centric World explorer in `NetworkGraph.tsx` + `src/lib/network/worlds.ts`. Helicopter / D3-force layout is parked (legacy `buildGraph.ts` / seed). |
| **Auth**           | Supabase Auth; link to `profiles` table via `user_id`                                                  |
| **File storage**   | Supabase Storage for avatars and event media links                                                     |
| **Search**         | Postgres full-text search initially; consider Meilisearch if skill search latency matters              |
| **Notifications**  | Supabase Realtime or edge functions for horizon subscription alerts                                    |
| **External links** | Events store `external_url` for tickets/info — no native checkout in MVP                               |


---

## 10. Open Questions


| #   | Question                                                             | Owner         | Blocking? |
| --- | -------------------------------------------------------------------- | ------------- | --------- |
| 1   | Auth method: magic link vs. OAuth (Google/Discord)                   | Product + Eng | Phase 1   |
| 2   | Exact FoF × co-attendee edge matrix **inside** a World (beyond the one shared-event layer) | Product + Eng | Before graph scale |
| 3   | Should groups appear as nodes on the graph, or only as linked pages? | Product       | Phase 2   |
| 4   | Naming for personal default Horizon (e.g. "Starred", "My Horizon")   | Product       | Phase 2   |
| 5   | Retribalise AI flow — license/API approach                           | Eng           | Phase 5+  |
| 6   | Spotify integration — API terms for Premium playback                 | Eng           | Phase 5+  |
| 7   | Event pages UI needs an upgrade (Sebastian) — card image placeholders landed; full event-detail redesign is parked | Product | No |
| 8   | First-time tips with Don’t show again — e.g. first open of Contact Lists and first Cluster create: “Lists stay secret / Clusters are shared.” Do not build the tips UI yet. | Product | No |
| 9   | Cluster / city as Worlds; Gravity defaults | Product | No |


**Resolved (keep for context)**

| Decision | Outcome |
| -------- | ------- |
| Event on multiple Horizons? | Yes — many-to-many (playlist model). |
| Horizon subscription notify | In-app for MVP; email later. |
| Contact in MVP | External channels on profile; in-app messaging later. |
| Privacy defaults | Public by default; toggles must be obvious. |
| Pre-alpha signup UI | Radically reworked — not the long-term shell. |
| Docs structure | Keep PROJECT_PLAN + USER_STORIES as two files. |
| Network Graph north star | Ego-centric 2D World explorer; not one global helicopter graph. Privacy = reach. (LOCKED 2026-09-12) |
| 3D | **Struck.** Permanently removed from this product line — not parked for later. Ego-centric 2D forever unless Sebastian reopens. (LOCKED 2026-09-12) |
| Hero / ego node | Always polychrome (rainbow/CRT, match `PolychromeFX`). **Plain circle + shine** — not diamond / faceted. Other nodes stay normal. (LOCKED 2026-09-12) |
| Graph IA | World → Gravity → Links → Visibility. Gravity designer and multi-layer dropdown farm parked. |
| Private event surf dial | Participants / Friends of participants (**default**) / Anyone. Controls marketing visibility and who can surf the twin. Post-event change notifies participants. |
| Dual privacy | Event privacy ≠ personal Chronicle / “I attended” privacy. |
| Open community Worlds | Surf irrespective of attendance; no admin gate to enter the twin. Hypernet-seeded and user-addable; publishable; verification badge after admin review. |
| Graph naming | Do not call the primary control “Cluster by.” Arrange by only if a layout mode returns later. |
| Looking for chips | Still out — do not build. |


---

## 11. Success Metrics (Post-Launch)


| Metric                      | Target (6 months) |
| --------------------------- | ----------------- |
| Registered nodes            | 500+              |
| Groups created              | 50+               |
| Events created              | 100+              |
| Horizon subscriptions       | 50+               |
| Skill searches per week     | 20+               |
| Camps using for recruitment | 5+                |


---

*Last updated: 2026-09-12 — 3D struck (not parked). Hero is a polychrome circle + shine (not faceted). World cards first; Gravity/Visibility/Links in-world only. Looking for chips still out. Event detail pages still need a UI upgrade (Sebastian, parked).*