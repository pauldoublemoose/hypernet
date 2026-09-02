# Hypernet — Project Plan

---

## 1. Product Summary

**Hypernet** is a social platform for the participatory event community — Burning Man camps, ravers, indie artists, and co-creators who build experiences together.

It is **not** a consumption feed like Facebook. It is a **recruitment and discovery tool**:

- Find people with the right skills before a burn or between seasons.
- Share events and horizons across the broader community (not just your friend group).
- Visualize the community as an interactive **network graph** — the core brand experience.

**MVP north star:** The first useful moment is discovering an event you want to go to — typically by browsing **groups** and their **horizons**, then saving or marking attendance.

**Key terminology**


| Term          | Meaning                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node**      | A person in the network (their profile). Used during onboarding: *"Create your node."*                                                                                                                                        |
| **Profile**   | A person's page — avatar, bio, skills, Chronicle. Synonymous with *node* in user-facing copy.                                                                                                                                 |
| **Group**     | An organization or collective (e.g. a camp, crew, label). Has admins **and members**, its own page, hosted events, and horizons.                                                                                              |
| **Link**      | A connection between two nodes on the graph. Exact link rules for large events are **TBD** (see §7.4) — avoid all-to-all edges for big events.                                                                                |
| **Chronicle** | A profile section listing events a person has participated in, with their role. Built from “going” attendance after the event date, or manual past entries.                                                                    |
| **Horizon**   | A publishable, subscribable collection of events (like a playlist/calendar). Owned by a profile or group. Multiple admins; contribution setting: *Admins only* or *Open*. Every profile also gets a **private default Horizon** (personal “liked / starred” list). |
| **Interested / Going** | Two ways to save an event: *Interested* adds it only to your default Horizon; *Going* asks for role (guest, co-creator, etc.) and later feeds Chronicle after the event. |
| **Looking for** | Needs or intents a person **broadcasts** so camps and crews can find them (the inverse of skill search). Two flavors — **event-scoped needs** (tied to an event; auto-expire when the event ends / after the event date) and **soft intents** (longer-lived; cleared manually and/or via a TTL). Designed now; **implement with Events (Phase 2+ / Core Growth)** — not MVP Profile chips. See subsection below. |


**User-facing one-liners** *(use consistently wherever the term first appears)*


| Term          | Explain it as…                                                    |
| ------------- | ----------------------------------------------------------------- |
| **Node**      | You in the network.                                               |
| **Horizon**   | A shared calendar — create one, add events, let others subscribe. |
| **Chronicle** | Your event history — what you've joined and the role you played.  |
| **Group**     | A camp, crew, or collective — run by people, with its own page.   |
| **Looking for** | Needs you broadcast so camps and crews can find you.            |


**Profile vs. Group vs. contact list**

- A **profile** represents a person; a **group** represents an organization. Both can publish events and horizons.
- A **contact list** is a private, user-defined list of people for invites and visibility — not the same as a group.
- **Group members** belong to the camp/collective; **group admins** manage the page. Distinct from contact lists.

**Looking for (designed now; implement with Events)**

People broadcast what they need so camps and crews can discover them — the other direction from skill search (camps hunting talent).

Two flavors:

1. **Event-scoped needs** — attached to a specific event. They **auto-expire when the event ends** (or after the event date). Example: looking for a camp or a ride *for this burn*.
2. **Soft intents** — longer-lived, not tied to one event. Cleared **manually** by the owner and/or via a **TTL** (time-to-live) so stale signals do not sit forever. Example: generally looking for a sound crew next season.

**Not current Profile / Settings work.** Do **not** add Looking-for chips (or similar) to the Phase 1 Profile or Settings UI. Implementation waits for Events (Phase 2+ / Core Growth). Stories: [USER_STORIES.md](./USER_STORIES.md) US-2.5–US-2.7.

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

1. **Graph as brand, not always as home** — The full interactive graph is a core brand experience, not necessarily the post-login home screen. Home may use an artistic / reduced graphic; discovery of groups and events comes first.
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
| **Network graph v1**      | Nodes = people. Full graph is its own view (not home). Link topology for large events **deferred** — see §7.4. Drag, zoom, click-through to profile.                   |
| **Graph filters**         | Toggle selected connections when link model is defined.                                                                                                                |
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
| **Looking for**       | Broadcast needs/intents so camps can find people. Event-scoped (auto-expire after the event) and soft intents (manual clear and/or TTL). **Not** MVP Profile chips — implement with Events (Phase 2+). See §1. |


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
| Profile page UI                  | Public by default; obvious privacy toggles; mobile-friendly. **No Looking-for chips** — that waits for Events (Core Growth). |
| Personal default Horizon         | Auto-create private “liked” Horizon at signup                       |
| Skill search (free text)         | Full-text match on profile skills; public profiles only             |
| Landing / home                   | Bias to discovery (groups/events); optional artistic graph motif    |
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
| Graph view                 | Dedicated screen (not home); link topology TBD — avoid all-to-all for large events                 |
| Past events                | Manual Chronicle entries allowed                                                                   |


**Follow-on (not this phase’s Profile work):** **Looking for** is designed in §1 and scheduled for Core Growth. Event-scoped needs depend on Events existing, so implementation is Phase 2+ — **do not** ship Profile chips in Phase 1 Identity & Profiles. See US-2.5–US-2.7.

**Exit criteria:** User browses group directory → opens camp Horizon → marks Going on an event with a role → after event date, Chronicle updates → subscriber of that Horizon saw in-app notice when event was added.

### Phase 3 — Discovery *(4–6 weeks)*

**Goal:** Community can find people and events beyond their immediate network.


| Task                | Notes                                    |
| ------------------- | ---------------------------------------- |
| Public event search | Filter by date, location, visibility     |
| Contact lists       | CRUD lists; add members; use for invites |
| Looking for         | Event-scoped needs + soft intents; camps find people by broadcast needs. Depends on Events. **Not** Profile chips. See §1 / US-2.5–US-2.7. |


**Exit criteria:** User searches public events by keyword and date range.

### Phase 4 — Privacy, Invites & Polish *(3–4 weeks)*

**Goal:** Trust and polish for real-world camp use.


| Task                 | Notes                                                         |
| -------------------- | ------------------------------------------------------------- |
| Granular privacy     | Friends-only + custom list visibility                         |
| Event invitations    | Invite contact list to event                                  |
| Graph physics polish | Spring/elastic links; smooth drag; zoom summary tooltip       |
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

graph_links (derived view — topology TBD)
  └── prefer group co-membership and/or co-creation roles; avoid all-to-all guest links for large events
  └── location_shared: optional

looking_for  -- Core Growth / Phase 2+; not MVP Profile
  └── profile_id
  └── flavor (event_scoped | soft_intent)
  └── need text
  └── event_id (required for event_scoped)
  └── expires_at  -- event end / event date, or TTL for soft intents
  └── cleared_at  -- manual clear (soft intents; optional for event-scoped)
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

### 7.4 Graph Interaction Spec

**Placement:** Full interactive graph is a **dedicated view**, not the post-login home. Home may include an artistic / reduced graphic of the network.

**Link topology — deferred decision (important):**  
All-to-all links for a 500-person event ≈ **~125,000 edges** — not workable. Treat detailed graph structure as its own design process. Working guidance for engineers until then:

| Approach | When it makes sense | Edge count (n people) |
| -------- | ------------------- | --------------------- |
| **Avoid: complete clique** | Never for large guest lists | n(n−1)/2 — explodes |
| **Star / hub** | Event or group as hub; people link to hub | ~n — scalable |
| **Co-creators only** | Links among Admin / Co-creator roles, not all Guests | small |
| **Group co-membership** | Links among camp members (camps are usually smaller) | manageable for small camps |
| **User-selected filters** | Only draw links for explicitly toggled events/groups | controlled |

Ship graph v1 with **nodes + basic interaction**; refine link rules with product before scaling to large events.

| Action                    | Behavior                                       |
| ------------------------- | ---------------------------------------------- |
| Default state             | Nodes float; links per TBD rules / filters     |
| Drag node                 | Node moves; connected nodes follow elastically |
| Hover / zoom node         | Summary tooltip (name, key skills)             |
| Click / double-click node | Navigate to full profile                       |
| City filter               | Optional — Phase 3+                            |


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
5. **Graph (full)** — Dedicated exploration view. Nodes = profiles. Link rules TBD.
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
| **Graph**          | Extend existing `NetworkGraph.tsx` / `buildGraph.ts` — evaluate D3-force or similar for spring physics |
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
| 2   | Graph link topology for large events (hub vs co-creators vs filters) | Product + Eng | Before graph scale |
| 3   | Should groups appear as nodes on the graph, or only as linked pages? | Product       | Phase 2   |
| 4   | Naming for personal default Horizon (e.g. "Starred", "My Horizon")   | Product       | Phase 2   |
| 5   | Retribalise AI flow — license/API approach                           | Eng           | Phase 5+  |
| 6   | Spotify integration — API terms for Premium playback                 | Eng           | Phase 5+  |


**Resolved (keep for context)**

| Decision | Outcome |
| -------- | ------- |
| Event on multiple Horizons? | Yes — many-to-many (playlist model). |
| Horizon subscription notify | In-app for MVP; email later. |
| Contact in MVP | External channels on profile; in-app messaging later. |
| Privacy defaults | Public by default; toggles must be obvious. |
| Pre-alpha signup UI | Radically reworked — not the long-term shell. |
| Docs structure | Keep PROJECT_PLAN + USER_STORIES as two files. |
| Looking for | Needs/intents people broadcast so camps can find them. Event-scoped auto-expire after the event; soft intents clear manually and/or via TTL. Design now; implement with Events (Phase 2+ / Core Growth). **Not** MVP Profile/Settings chips. |


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

*Last updated: Sep 2026 — derived from product vision voice notes; Looking for designed for Events (Phase 2+ / Core Growth).*