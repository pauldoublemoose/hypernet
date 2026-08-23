# Hypernet — Project Plan

> **Audience:** Backend-focused engineers building the front end with AI assistance in Cursor.  
> **Source:** Product vision voice notes (Aug 2026).  
> **Current codebase:** Pre-alpha signup terminal with Supabase, network graph prototype, and theme system.

---

## 1. Product Summary

**Hypernet** is a social platform for the participatory event community — Burning Man camps, ravers, indie artists, and co-creators who build experiences together.

It is **not** a consumption feed like Facebook. It is a **recruitment and discovery tool**:

- Find people with the right skills before a burn or between seasons.
- Share events and calendars across the broader community (not just your friend group).
- Visualize the community as an interactive **network graph** — the core brand experience.

**Key terminology**

| Term | Meaning |
| --- | --- |
| **Node** | A person in the network (their profile). Used during onboarding: *"Create your node."* |
| **Edge** | A connection between two nodes — typically a shared event, or shared city. |
| **Event Resume** | A profile section listing events a person has participated in, with their role. *(Working name — rename before launch.)* |
| **Calendar** | A publishable, subscribable collection of events owned by a user or org. |

---

## 2. Problems We Are Solving

| Problem | Today | Hypernet solution |
| --- | --- | --- |
| **Camp recruitment** | Word of mouth within friend groups; hard to find talent outside your circle | Searchable skills/interests + profile discovery via graph |
| **Event discovery** | Events shared only in private networks | Public/subscribable calendars + searchable event database |
| **Community visibility** | No shared record of who built what | Event Resume on profiles; graph edges show co-participation |
| **Creator economics** | High ticket fees (e.g. Billetto ~10%) | *(Future)* Lower-cost ticketing |

---

## 3. Design Principles (Non-Negotiable)

These apply from **Phase 1 onward**, not as a late polish pass.

1. **Graph-first brand** — The network visualization is what people remember. Invest in physics, motion, and interaction quality early.
2. **Streamlined UI** — Every screen uses space intelligently. No clutter from tags, toggles, or buttons that are not immediately useful.
3. **Retro-futuristic aesthetic** — CRT lines, monospace fonts, chrome/silver accents. Three theme modes (see §8).
4. **User-controlled visibility** — Profile fields, events, and connections are governed by granular privacy settings.
5. **Fast path to value** — Signup creates a node in seconds; profile details are filled in later.

---

## 4. Feature Tiers

### 4.1 MVP (Must Have — Phase 1–2)

| Feature | Description |
| --- | --- |
| **Fast signup** | Minimal fields to create a node and join the network. Profile editing deferred. |
| **Profile page** | Avatar, short bio, skills/interests (free text for now). |
| **Basic event creation** | Title, date, description, visibility toggle (public/private). External ticket/link URL is fine — no native ticketing required. |
| **Event database** | Events stored persistently; past events can be added to a user's Event Resume with role. |
| **Event roles** | Guest, Co-creator, Sponsor, Admin — color-coded (see §8). |
| **Network graph v1** | Nodes = people. Edges = shared events and/or city. Drag, zoom, click-through to profile. |
| **Graph filters** | Toggle event connections on/off; selected events pull related nodes together. |
| **Skill search** | Find people by skill tag or free-text match (e.g. "sound engineering"). |
| **Theme system** | Light, Dark, and Polychrome modes. |
| **Basic privacy** | Per-field or per-section visibility: Public / Private (Friends-only and custom lists in Phase 3). |

### 4.2 Core Growth (Should Have — Phase 3–4)

| Feature | Description |
| --- | --- |
| **Calendars** | Users publish calendars; others subscribe and get notified when events are added. |
| **Calendar subscriptions** | Notification when a subscribed calendar gets a new event. |
| **Contact lists** | User-defined groups (e.g. "Camp crew", "Sound team") for targeted event invites. |
| **Granular privacy** | Public / Friends-only / Private / Custom list visibility per field or section. |
| **Skills taxonomy** | Structured tags derived from accumulated free-text skills (data-driven, not designed upfront). |
| **Event invitations** | Invite contact lists to events. |

### 4.3 Future (Nice to Have — Phase 5+)

| Feature | Description |
| --- | --- |
| **AI profile generation** | 2–3 onboarding questions → AI-written profile blurb. Reference: [Retribalise](https://retribalise.com) approach. |
| **Tiered event media access** | Role-based access to photos, videos, recordings post-event (Patreon-like; links OK, hosting optional). |
| **Profile & event customization** | MySpace-style creative expression (custom layouts, etc.). |
| **Profile music** | Spotify Premium / SoundCloud integration with native Hypernet player (no ugly embeds, no 30s preview limit). |
| **Ticketing** | Community-friendly ticket sales with lower fees than incumbents. |
| **Polychrome highlight node** | Special visual treatment for first node / creation moment — rainbow explosion on signup. |

---

## 5. Event Role Color System

Use consistently across profiles, Event Resume, graph badges, and event pages.

| Role | Color | Token name (suggested) |
| --- | --- | --- |
| Guest | White | `--role-guest` |
| Co-creator | Black | `--role-cocreator` |
| Sponsor | Chrome / silver | `--role-sponsor` |
| Admin | Polychrome (rainbow) | `--role-admin` |

---

## 6. Phased Roadmap

### Phase 0 — Pre-Alpha *(Done)*

- [x] CRT terminal signup flow
- [x] Supabase schema for signups, skills, locations
- [x] Network graph prototype (`NetworkGraph.tsx`)
- [x] Theme switching: light / dark / polychrome (`PolychromeFX.tsx`, `ui.tsx`)
- [x] Chrome frame UI shell (`TerminalFrame.tsx`)

### Phase 1 — Identity & Profiles *(4–6 weeks)*

**Goal:** A user can sign up, edit a profile, and appear as a node on the graph.

| Task | Notes |
| --- | --- |
| Auth (email magic link or OAuth) | Replace anonymous signup insert with authenticated users |
| User ↔ signup migration | Map existing `signups` rows to `users` / `profiles` |
| Profile CRUD API | Avatar upload, bio, skills (free text), location |
| Profile page UI | Retro-terminal aesthetic; mobile-friendly |
| Landing page | Signup CTA as first action |
| Privacy v1 | Public / Private per profile section |

**Exit criteria:** New user signs up → edits profile → appears on graph as isolated node.

### Phase 2 — Events & Event Resume *(4–6 weeks)*

**Goal:** Users create events, link participation with roles, and build an Event Resume.

| Task | Notes |
| --- | --- |
| Events schema | title, dates, description, visibility, external_url, owner_id |
| Event participation schema | user_id, event_id, role (guest/cocreator/sponsor/admin) |
| Event creation flow | Minimal form; link-out for tickets/details OK |
| Event Resume on profile | Filterable list with role badges (color-coded) |
| Graph edges from events | Toggle event → pull co-participants together |
| Past events | Allow adding historical events to resume |

**Exit criteria:** Two users co-listed on an event → graph shows edge when that event filter is on.

### Phase 3 — Discovery & Calendars *(4–6 weeks)*

**Goal:** Community can find people and events beyond their immediate network.

| Task | Notes |
| --- | --- |
| Skill search | Full-text or tag match on profile skills |
| Public event search | Filter by date, location, visibility |
| Calendar entity | Owner, name, description, visibility |
| Calendar ↔ events | Events belong to one or more calendars |
| Subscriptions | Subscribe to calendar; notification on new event |
| Contact lists | CRUD lists; add members; use for invites |

**Exit criteria:** User subscribes to a camp calendar → gets notified when camp publishes a new event.

### Phase 4 — Privacy, Invites & Polish *(3–4 weeks)*

**Goal:** Trust and polish for real-world camp use.

| Task | Notes |
| --- | --- |
| Granular privacy | Friends-only + custom list visibility |
| Event invitations | Invite contact list to event |
| Graph physics polish | Spring/elastic edges; smooth drag; zoom summary tooltip |
| Skills taxonomy v1 | Cluster free-text skills into suggested tags |
| Performance | Graph rendering with 100+ nodes |

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

## 7. Data Model (High-Level)

```
users
  └── profiles (avatar, bio, skills[], location, privacy_settings)
  └── contact_lists
        └── contact_list_members

events
  └── event_participants (user_id, role)
  └── visibility, external_url, dates, description

calendars
  └── calendar_events (calendar_id, event_id)
  └── calendar_subscriptions (user_id, calendar_id)

graph_edges (derived view)
  └── event_shared: users who share an event participation
  └── location_shared: users in same city (optional edge type)
```

Existing `signups`, `skill_options`, and `location_options` tables from pre-alpha should be migrated, not discarded.

---

## 8. Visual Design System

### 8.1 Theme Modes

| Mode | Base | Accents | Usage |
| --- | --- | --- | --- |
| **Light** | Black text on white | Chrome / silver | Default |
| **Dark** | White text on black | More chrome than light mode | Night / indoor |
| **Polychrome** | Rainbow holographic | Animated, shiny, dynamic | Brand moments, Admin role, easter egg toggle |

Polychrome is a **brand identity element**, not a gimmick. Use it sparingly in special locations (Admin badges, highlight node on creation, role indicators).

### 8.2 Typography & Texture

- Monospace / terminal fonts (VT323 or similar — already in codebase)
- CRT scanline overlay
- Chrome frame borders (existing `TerminalFrame.tsx`, `public/chrome-concept.html`)

### 8.3 Graph Interaction Spec

| Action | Behavior |
| --- | --- |
| Default state | Nodes float with no edges visible |
| Toggle event filter | Edges appear; connected nodes spring together |
| Drag node | Node moves; connected nodes follow elastically |
| Hover / zoom node | Summary tooltip (name, key skills) |
| Click / double-click node | Navigate to full profile |
| City filter | Optional edge type based on location |

---

## 9. Where to Start Streamlining the UI

**Start now, in Phase 1** — not after features are built.

Recommended approach for a non-designer product owner working with engineers:

### Step 1: Define the 5 core screens (wireframe in words)

Before building features, agree on these screens and what each shows:

1. **Landing** — One CTA: "Create your node." Nothing else competes for attention.
2. **Profile (view)** — Avatar, bio, skills, Event Resume tab, graph mini-preview.
3. **Profile (edit)** — Same layout as view, inline editable fields.
4. **Graph (full)** — Full-screen visualization with filter bar (events, skills, city).
5. **Event (view/create)** — Title, date, role list, external link, visibility toggle.

Every other screen is a variation of these five.

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

**Do not introduce new visual patterns** until the five core screens feel consistent.

### Step 4: Product owner review gate

Before merging any UI PR:

1. Open the app on desktop and phone.
2. Walk through: signup → profile → graph → event in under 2 minutes.
3. Flag anything that feels cluttered or redundant.

This keeps you in the design loop without needing to write CSS.

---

## 10. Technical Notes for Engineers

| Area | Recommendation |
| --- | --- |
| **Stack** | Continue Vite + React + Supabase (already in place) |
| **Graph** | Extend existing `NetworkGraph.tsx` / `buildGraph.ts` — evaluate D3-force or similar for spring physics |
| **Auth** | Supabase Auth; link to `profiles` table via `user_id` |
| **File storage** | Supabase Storage for avatars and event media links |
| **Search** | Postgres full-text search initially; consider Meilisearch if skill search latency matters |
| **Notifications** | Supabase Realtime or edge functions for calendar subscription alerts |
| **External links** | Events store `external_url` for tickets/info — no native checkout in MVP |

---

## 11. Open Questions

| # | Question | Owner | Blocking? |
| --- | --- | --- | --- |
| 1 | Final name for "Event Resume" (e.g. *Track Record*, *Participation Log*, *Event History*) | Product | No |
| 2 | Auth method: magic link vs. OAuth (Google/Discord) | Product + Eng | Phase 1 |
| 3 | Can one event belong to multiple calendars? | Product | Phase 3 |
| 4 | Graph edge: same city only, or same country? | Product | Phase 2 |
| 5 | Retribalise AI flow — license/API approach | Eng | Phase 5+ |
| 6 | Spotify integration — API terms for Premium playback | Eng | Phase 5+ |

---

## 12. Success Metrics (Post-Launch)

| Metric | Target (6 months) |
| --- | --- |
| Registered nodes | 500+ |
| Events created | 100+ |
| Calendar subscriptions | 50+ |
| Skill searches per week | 20+ |
| Camps using for recruitment | 5+ |

---

*Last updated: Aug 2026 — derived from product vision voice notes.*
