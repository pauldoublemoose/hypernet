# Hypernet — Project Plan

---

## 1. Product Summary

**Hypernet** is a social platform for the participatory event community — Burning Man camps, ravers, indie artists, and co-creators who build experiences together.

It is **not** a consumption feed like Facebook. It is a **recruitment and discovery tool**:

- Find people with the right skills before a burn or between seasons.
- Share events and horizons across the broader community (not just your friend group).
- Visualize the community as an interactive **network graph** — the core brand experience.

**Key terminology**


| Term          | Meaning                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Node**      | A person in the network (their profile). Used during onboarding: *"Create your node."*                             |
| **Profile**   | A person's page — avatar, bio, skills, Chronicle. Synonymous with *node* in user-facing copy.                      |
| **Group**     | An organization or collective (e.g. a camp, crew, label). Has its own page, managed by one or more profile admins. |
| **Link**      | A connection between two nodes — typically a shared event, or shared city.                                         |
| **Chronicle** | A profile section listing events a person has participated in, with their role.                                    |
| **Horizon**   | A publishable, subscribable collection of events owned by a profile or a group. Multiple horizon admins; **contribution setting** controls who may add events: *Admins only* (default) or *Open* (any authenticated profile). |

**User-facing one-liners** *(use consistently wherever the term first appears)*

| Term | Explain it as… |
| ---- | -------------- |
| **Node** | You in the network. |
| **Horizon** | A shared calendar — create one, add events, let others subscribe. |
| **Chronicle** | Your event history — what you've joined and the role you played. |
| **Group** | A camp, crew, or collective — run by people, with its own page. |


**Profile vs. Group vs. contact list**

- A **profile** represents a person; a **group** represents an organization. Both can publish events and horizons.
- A **contact list** is a private, user-defined list of people for invites and visibility — not the same as a group.

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

1. **Graph-first brand** — The network visualization is what people remember. Invest in physics, motion, and interaction quality early.
2. **Streamlined UI** — Every screen uses space intelligently. No clutter from tags, toggles, or buttons that are not immediately useful.
3. **Retro-futuristic aesthetic mixed with high-end sleek design** — CRT lines, monospace fonts, white and black plus chrome/silver accents and rainbow/polychrome highlights. Three theme modes (see §7).
4. **User-controlled visibility** — Profile and group fields, events, and connections are governed by granular privacy settings.
5. **Fast path to value** — Signup creates a node in seconds; profile details are filled in later.
6. **Explain the language** — Hypernet uses its own terms. Where one isn't obvious, show a brief inline explanation at the point of use — the same wording sitewide, never a wall of jargon. Onboarding introduces concepts only when the user reaches them.

---

## 4. Feature Tiers

### 4.1 MVP (Must Have — Phase 1–2)

**Skill search vs. skills taxonomy:** MVP ships **free-text skill search** (camp recruitment depends on it). Structured **skills taxonomy** — browseable tags clustered from user input — comes in Core Growth once enough profiles exist.


| Feature                  | Description                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast signup**          | Minimal fields to create a node and join the network. Profile editing deferred.                                                                                        |
| **Profile page**         | Avatar, short bio, skills/interests (free text for now).                                                                                                               |
| **Group page**           | Organization profile (e.g. camp): name, image, description. Managed by profile admin(s).                                                                               |
| **Basic event creation** | Title, date, description, visibility toggle (public/private). Hosted by a **profile** or a **group**. External ticket/link URL is fine — no native ticketing required. |
| **Event database**       | Events stored persistently; past events can be added to a user's Chronicle with role.                                                                                  |
| **Event roles**          | Guest, Co-creator, Sponsor, Admin — color-coded (see §7.2).                                                                                                              |
| **Network graph v1**     | Nodes = people. Links = shared events and/or city. Drag, zoom, click-through to profile.                                                                               |
| **Graph filters**        | Toggle event connections on/off; selected events pull related nodes together.                                                                                          |
| **Skill search**         | Find people by free-text match on profile skills (e.g. "sound engineering"). Essential for camp recruitment. |
| **Horizons**             | Profiles and groups publish horizons. Multiple horizon admins. Contribution setting: admins only or open.       |
| **Horizon subscriptions** | Subscribe to a horizon; get notified when a new event is added.                                                |
| **Theme system**         | Light, Dark, and Polychrome modes.                                                                                                                                     |
| **Basic privacy**        | Per-field or per-section visibility: Public / Private (Friends-only and custom lists in Phase 3).                                                                      |
| **Contextual copy**      | Every feature screen includes a one-line explanation of what the user is looking at (see terminology one-liners). Onboarding flows step-by-step without overwhelming. |


### 4.2 Core Growth (Should Have — Phase 3–4)


| Feature                   | Description                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Contact lists**         | User-defined lists of profiles (e.g. "Camp crew", "Sound team") for targeted event invites — distinct from groups. |
| **Granular privacy**      | Public / Friends-only / Private / Custom list visibility per field or section.                                     |
| **Skills taxonomy**       | Structured, browseable tags derived from accumulated free-text skills (data-driven — not in MVP).          |
| **Event invitations**     | Invite contact lists to events.                                                                                    |


### 4.3 Future (Nice to Have — Phase 5+)


| Feature                           | Description                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
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

**Goal:** A user can sign up, edit a profile, and appear as a node on the graph.


| Task                             | Notes                                                    |
| -------------------------------- | -------------------------------------------------------- |
| Auth (email magic link or OAuth) | Replace anonymous signup insert with authenticated users |
| User ↔ signup migration          | Map existing `signups` rows to `users` / `profiles`      |
| Profile CRUD API                 | Avatar upload, bio, skills (free text), location         |
| Profile page UI                  | Retro-terminal aesthetic; mobile-friendly                |
| Skill search (free text)         | Full-text match on profile skills; public profiles only  |
| Landing page                     | Signup CTA as first action                               |
| Contextual copy & onboarding     | One-liner per concept at first touch; progressive, not front-loaded |
| Privacy v1                       | Public / Private per profile section                     |


**Exit criteria:** New user signs up → edits profile with skills → searchable by skill keyword → appears on graph as isolated node.

### Phase 2 — Events, Groups, Horizons & Chronicle *(4–6 weeks)*

**Goal:** Profiles and groups create events and horizons, link participation with roles, and build Chronicles.


| Task                       | Notes                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Groups schema              | name, description, avatar, visibility; `group_admins` links profiles with admin role           |
| Group page UI              | Public group profile; admin-only edit mode                                                     |
| Create & admin a group     | Any profile can create a group; creator becomes admin; add/remove admins (Facebook-style)      |
| Events schema              | title, dates, description, visibility, external_url; host = profile **or** group (polymorphic) |
| Event participation schema | user_id, event_id, role (guest/cocreator/sponsor/admin)                                        |
| Event creation flow        | Choose host: my profile or a group I admin; link-out for tickets/details OK                    |
| Horizons schema            | owner (profile or group), name, description, visibility, contribution setting (admins only / open) |
| Horizon admins             | `horizon_admins` — multiple profiles can add events to a horizon                               |
| Horizon ↔ events           | Add events during or after creation; enforce contribution setting                              |
| Horizon subscriptions      | Subscribe/unsubscribe; notify subscribers when an event is added                               |
| Chronicle on profile       | Filterable list with role badges (color-coded)                                                 |
| Group hosted events        | Group page lists events hosted by that group                                                   |
| Graph links from events    | Toggle event → pull co-participants together                                                   |
| Past events                | Allow adding historical events to Chronicle                                                    |


**Exit criteria:** Camp group publishes a horizon → co-admin adds an event → subscriber gets notified → two participant profiles co-listed on event → graph shows link when that event filter is on.

### Phase 3 — Discovery *(4–6 weeks)*

**Goal:** Community can find people and events beyond their immediate network.


| Task                | Notes                                            |
| ------------------- | ------------------------------------------------ |
| Public event search | Filter by date, location, visibility             |
| Contact lists       | CRUD lists; add members; use for invites         |


**Exit criteria:** User searches public events by keyword and date range.

### Phase 4 — Privacy, Invites & Polish *(3–4 weeks)*

**Goal:** Trust and polish for real-world camp use.


| Task                 | Notes                                                   |
| -------------------- | ------------------------------------------------------- |
| Granular privacy     | Friends-only + custom list visibility                   |
| Event invitations    | Invite contact list to event                            |
| Graph physics polish | Spring/elastic links; smooth drag; zoom summary tooltip |
| Skills taxonomy v1   | Cluster free-text skills into browseable tags; enhance search |
| Performance          | Graph rendering with 100+ nodes                         |


**Exit criteria:** Camp admin invites "Sound team" list to event; only invited members see private event details.

### Phase 5+ — Future Backlog

Prioritize based on user feedback after Phase 4 launch.

- AI profile generation (Retribalise-style)
- Tiered post-event media access
- Profile/event page customization (MySpace-style)
- Spotify / SoundCloud profile music
- Native ticketing
- Polychrome signup celebration animation

---

## 6. Data Model (High-Level)

```
users
  └── profiles (avatar, bio, skills[], location, privacy_settings)
  └── contact_lists
        └── contact_list_members

groups
  └── name, description, avatar, visibility
  └── group_admins (profile_id, group_id, role: admin)

events
  └── host_type (profile | group), host_id
  └── event_participants (user_id, role)
  └── visibility, external_url, dates, description

horizons
  └── owner_type (profile | group), owner_id
  └── name, description, visibility
  └── contribution_setting (admins_only | open)
  └── horizon_admins (profile_id, horizon_id)
  └── horizon_events (horizon_id, event_id)
  └── horizon_subscriptions (user_id, horizon_id)

graph_links (derived view)
  └── event_shared: profiles who share an event participation
  └── location_shared: profiles in same city (optional link type)
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


| Action                    | Behavior                                       |
| ------------------------- | ---------------------------------------------- |
| Default state             | Nodes float with no links visible              |
| Toggle event filter       | Links appear; connected nodes spring together  |
| Drag node                 | Node moves; connected nodes follow elastically |
| Hover / zoom node         | Summary tooltip (name, key skills)             |
| Click / double-click node | Navigate to full profile                       |
| City filter               | Optional link type based on location           |


---

## 8. Where to Start Streamlining the UI

**Start now, in Phase 1** — not after features are built.

Recommended approach for a non-designer product owner working with engineers:

### Step 1: Define the 7 core screens (wireframe in words)

Before building features, agree on these screens and what each shows:

1. **Landing** — One CTA: "Create your node." Nothing else competes for attention.
2. **Profile (view)** — Avatar, bio, skills, Chronicle tab, graph mini-preview.
3. **Profile (edit)** — Same layout as view, inline editable fields.
4. **Group (view)** — Name, image, description, hosted events, horizons. Admin sees edit controls.
5. **Graph (full)** — Full-screen visualization with filter bar (events, skills, city). Nodes = profiles only.
6. **Event (view/create)** — Title, date, host (profile or group), role list, external link, visibility toggle.
7. **Horizon (view/create)** — Name, description, event list, contribution setting, admin list, subscribe button.

Every other screen is a variation of these seven.

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

**Do not introduce new visual patterns** until the seven core screens feel consistent.

### Step 4: Product owner review gate

Before merging any UI PR:

1. Open the app on desktop and phone.
2. Walk through: signup → profile → group → horizon → graph → event in under 2 minutes.
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
| 2   | Can one event belong to multiple horizons?                           | Product       | Phase 2   |
| 3   | Graph link: same city only, or same country?                         | Product       | Phase 2   |
| 4   | Should groups appear as nodes on the graph, or only as linked pages? | Product       | Phase 2   |
| 5   | Retribalise AI flow — license/API approach                           | Eng           | Phase 5+  |
| 6   | Spotify integration — API terms for Premium playback                 | Eng           | Phase 5+  |


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

*Last updated: Aug 2026 — derived from product vision voice notes.*