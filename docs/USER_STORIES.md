# Hypernet — User Stories

> **Format:** `[PRIORITY] As a <role>, I want <goal>, so that <benefit>.`  
> **Priority:** `P0` = MVP · `P1` = Core growth · `P2` = Future  
> **Status:** `🔲` Not started · `🟡` In progress · `✅` Done

---

## Epic 1: Onboarding & Identity

### US-1.1 — Fast node creation `P0` 🔲

**As a** new visitor,  
**I want** to create my node with minimal information,  
**So that** I can join the network in seconds and fill in details later.

**Acceptance criteria**
- [ ] Landing page presents a single primary action: create node / sign up
- [ ] Required fields at signup: email (or OAuth) + display name only
- [ ] User is authenticated and redirected to profile edit after signup
- [ ] No multi-step wizard blocking access to the network

---

### US-1.2 — Edit my profile `P0` 🔲

**As a** registered node,  
**I want** to add an avatar, bio, and skills/interests to my profile,  
**So that** others can discover what I contribute and recruit me.

**Acceptance criteria**
- [ ] Profile supports: avatar image, brief description, skills/interests (free text)
- [ ] Changes save and are visible on my public profile immediately (respecting privacy)
- [ ] Skills field accepts free text; no taxonomy required in MVP
- [ ] Profile page matches Hypernet visual identity (terminal aesthetic, theme-aware)

---

### US-1.3 — Control profile visibility `P0` 🔲

**As a** node owner,  
**I want** to set each profile section as public or private,  
**So that** I control who sees my information.

**Acceptance criteria**
- [ ] Each section (avatar, bio, skills, Chronicle) has a visibility toggle: Public / Private
- [ ] Private sections are hidden from other users and excluded from search
- [ ] Owner always sees their own full profile

---

### US-1.4 — Granular privacy with contact lists `P1` 🔲

**As a** node owner,  
**I want** to share specific profile sections with custom contact lists,  
**So that** I can show camp-internal info to my crew without making it public.

**Acceptance criteria**
- [ ] Visibility options include: Public / Friends-only / Private / Custom list
- [ ] User can create named contact lists and add members
- [ ] Custom list visibility is enforced on profile view and search

---

### US-1.5 — AI-generated profile description `P2` 🔲

**As a** new node,  
**I want** to answer 2–3 questions and receive an AI-written profile description,  
**So that** I can present myself well without struggling to write copy.

**Acceptance criteria**
- [ ] Optional onboarding flow with 2–3 prompts
- [ ] AI returns editable profile description text
- [ ] User can accept, edit, or discard the suggestion
- [ ] Reference implementation studied: Retribalise project

---

### US-1.6 — Understand what I'm looking at `P0` 🔲

**As a** new user unfamiliar with Hypernet's terminology,  
**I want** a brief explanation whenever I encounter a concept like Horizon or Chronicle,  
**So that** I know what I'm interacting with without leaving the flow.

**Acceptance criteria**
- [ ] Each major feature screen includes a one-line description at first point of use (see PROJECT_PLAN.md §1 one-liners)
- [ ] Same wording used everywhere for the same concept — no inconsistent paraphrasing
- [ ] Explanations are inline or immediately adjacent — no separate docs page required
- [ ] Onboarding is progressive: concepts introduced when relevant, not dumped upfront
- [ ] New user can complete signup → profile → first horizon without confusion

---

## Epic 2: Recruitment & Discovery

### US-2.1 — Search people by skill `P0` 🔲

**As a** camp lead preparing for a burn,  
**I want** to search for people with a specific skill (e.g. "sound engineering"),  
**So that** I can recruit talent outside my friend group.

**Acceptance criteria**
- [ ] Search input matches against profile skills (free text)
- [ ] Results show avatar, name, bio excerpt, and link to full profile
- [ ] Only public profiles/skills appear in results
- [ ] Empty state explains how to refine search

---

### US-2.2 — Browse skills taxonomy `P1` 🔲

**As a** recruiter,  
**I want** to browse a structured list of skill tags,  
**So that** I can discover common skills without guessing exact search terms.

**Acceptance criteria**
- [ ] Taxonomy generated from aggregated free-text skills (not manually curated upfront)
- [ ] Tags are clickable and trigger people search
- [ ] Users can still enter free-text skills on their profile

---

### US-2.3 — View someone's Chronicle `P0` 🔲

**As a** recruiter,  
**I want** to see what events a person has participated in and in what role,  
**So that** I can judge their experience before reaching out.

**Acceptance criteria**
- [ ] Profile has a "Chronicle" tab
- [ ] Lists events the user chose to share, with role badge per event
- [ ] Role badges are color-coded: Guest=white, Co-creator=black, Sponsor=chrome, Admin=polychrome
- [ ] Respects visibility settings (hidden events do not appear)

---

---

## Epic 3: Groups

### US-3.0 — Create a group `P0` 🔲

**As a** camp lead or collective organizer,  
**I want** to create a group page for my camp or organization,  
**So that** we have a shared presence on Hypernet separate from my personal profile.

**Acceptance criteria**
- [ ] Any authenticated profile can create a group
- [ ] Group fields: name, image, brief description, visibility (public/private)
- [ ] Creator is automatically assigned as group admin
- [ ] Group has a public URL distinct from the creator's profile

---

### US-3.0b — Admin a group `P0` 🔲

**As a** group admin,  
**I want** to manage my group's page and add other admins,  
**So that** the camp can be run by a team, similar to a Facebook page.

**Acceptance criteria**
- [ ] Admins can edit group name, image, and description
- [ ] Admins can add or remove other profile admins
- [ ] Non-admins see the group page in read-only mode
- [ ] Admin status is visible to group admins (not necessarily public)

---

### US-3.0c — View a group page `P0` 🔲

**As a** community member,  
**I want** to visit a group's page and see its hosted events and horizons,  
**So that** I can follow what a camp or collective is doing.

**Acceptance criteria**
- [ ] Group page shows: name, image, description, list of hosted events
- [ ] Links to group's public horizons (if any)
- [ ] Respects group visibility settings
- [ ] Matches Hypernet visual identity (terminal aesthetic, theme-aware)

---

## Epic 4: Events

### US-3.1 — Create a basic event `P0` 🔲

**As an** event creator,  
**I want** to publish an event hosted by my profile or a group I admin,  
**So that** the community can discover it on Hypernet under the right identity.

**Acceptance criteria**
- [ ] Event fields: title, date(s), description, visibility (public/private)
- [ ] Host selector: my profile **or** a group where I am admin
- [ ] Optional external URL for tickets or more info (link to Billetto, etc. is fine)
- [ ] Creator is automatically listed as Admin on the event (as a participant)
- [ ] Event page displays the host (profile or group) with link to their page
- [ ] Event is stored in the database and searchable if public

---

### US-3.2 — Add past events to my Chronicle `P0` 🔲

**As a** co-creator,  
**I want** to add past events I participated in to my Chronicle,  
**So that** my history is visible even for events not originally created on Hypernet.

**Acceptance criteria**
- [ ] User can manually add an event to their Chronicle with: event name, date, role
- [ ] Added events appear on profile with correct role badge
- [ ] User controls visibility of each Chronicle entry

---

### US-3.3 — Register participation with role `P0` 🔲

**As an** event admin,  
**I want** to list co-creators, guests, sponsors, and admins on my event,  
**So that** participation is recorded accurately on everyone's Chronicle.

**Acceptance criteria**
- [ ] Event page shows participant list grouped or badged by role
- [ ] Adding a participant creates an entry on their Chronicle (if they accept or if admin adds them)
- [ ] Role colors match the global scheme (see PROJECT_PLAN.md §7.2)

---

### US-3.4 — Invite contact lists to an event `P1` 🔲

**As an** event admin,  
**I want** to invite everyone on a contact list to my event,  
**So that** I can reach my camp crew without inviting people one by one.

**Acceptance criteria**
- [ ] Event creation/edit includes "Invite list" dropdown of user's contact lists
- [ ] Invited users receive a notification (in-app minimum; email optional)
- [ ] Private events are visible only to invited users

---

### US-3.5 — Tiered access to event media `P2` 🔲

**As an** event admin,  
**I want** to grant post-event media access based on participant role,  
**So that** co-creators and sponsors get photos/videos that guests do not.

**Acceptance criteria**
- [ ] Event has a "Media" section with links (not necessarily hosted on Hypernet)
- [ ] Access rules: Guest / Co-creator / Sponsor / Admin tiers
- [ ] User sees only media sections their role unlocks
- [ ] Tier badges use the standard role color scheme

---

### US-3.6 — Sell tickets with low fees `P2` 🔲

**As an** event creator,  
**I want** to sell tickets through Hypernet with lower fees than Billetto (~10%),  
**So that** more revenue stays in the community.

**Acceptance criteria**
- [ ] TBD — scoped for future phase; not required for MVP
- [ ] MVP accepts external ticket URL on event page

---

## Epic 5: Horizons

### US-4.1 — Publish a horizon `P0` 🔲

**As a** camp or collective admin,  
**I want** to publish a horizon of our events on behalf of my group,  
**So that** the community can follow all our activities in one place.

**Acceptance criteria**
- [ ] A profile or group admin can create a horizon with name and description
- [ ] Horizon has visibility setting (public/private)
- [ ] Horizon has a contribution setting: **Admins only** (default) or **Open** (any authenticated user may add events)
- [ ] Events can be added to a horizon during or after event creation (subject to contribution setting)
- [ ] Public horizons have a shareable URL
- [ ] Horizon page shows owner (profile or group) with link

---

### US-4.1b — Admin a horizon `P0` 🔲

**As a** horizon owner,  
**I want** to assign other profiles as horizon admins,  
**So that** multiple co-organizers can curate events on the same horizon.

**Acceptance criteria**
- [ ] Horizon owner can add or remove horizon admins
- [ ] Horizon admins can add events to the horizon (when contribution setting is Admins only)
- [ ] Horizon admins can edit horizon metadata (name, description) — owner retains delete and settings control
- [ ] Non-admins cannot add events unless the horizon is set to Open

---

### US-4.2 — Subscribe to a horizon `P0` 🔲

**As a** community member,  
**I want** to subscribe to a camp's horizon,  
**So that** I am notified when they add new events.

**Acceptance criteria**
- [ ] Subscribe/unsubscribe button on horizon page
- [ ] Notification delivered when a new event is added (in-app minimum)
- [ ] Subscriber sees new events in a personal "My subscriptions" view

---

### US-4.3 — Search public events `P1` 🔲

**As a** community member,  
**I want** to search the public event database,  
**So that** I can find events beyond my immediate network.

**Acceptance criteria**
- [ ] Search/filter by date range, keyword, location (if available)
- [ ] Only public events appear
- [ ] Results link to event detail page

---

## Epic 6: Network Graph

### US-5.1 — Explore the network graph `P0` 🔲

**As a** visitor,  
**I want** to see all nodes in an interactive graph visualization,  
**So that** I can visually explore the Hypernet community.

**Acceptance criteria**
- [ ] Full-screen graph view with nodes representing people
- [ ] Default state: nodes float with no links visible
- [ ] Graph uses Hypernet aesthetic (terminal/CRT, theme-aware)
- [ ] Performs acceptably with 50+ nodes

---

### US-5.2 — Filter graph by event `P0` 🔲

**As a** user,  
**I want** to toggle an event's connections on the graph,  
**So that** I can see who co-participated and watch nodes pull together.

**Acceptance criteria**
- [ ] Event filter control (dropdown or multi-select) in graph UI
- [ ] Enabling an event draws links between co-participants
- [ ] Connected nodes animate together with spring/elastic physics
- [ ] Multiple events can be toggled simultaneously

---

### US-5.3 — Interact with graph nodes `P0` 🔲

**As a** user,  
**I want** to drag, zoom, and click nodes on the graph,  
**So that** I can explore profiles naturally.

**Acceptance criteria**
- [ ] Drag a node — it moves; connected nodes follow elastically
- [ ] Zoom/hover on a node — summary tooltip (name, key skills)
- [ ] Click or double-click a node — navigate to that person's profile
- [ ] Pinch/zoom and pan on mobile

---

### US-5.4 — Filter graph by city `P1` 🔲

**As a** user,  
**I want** to toggle city-based connections on the graph,  
**So that** I can see who is nearby geographically.

**Acceptance criteria**
- [ ] City/location filter draws links between nodes sharing a city
- [ ] Can be combined with event filters
- [ ] Location data comes from profile (already collected in pre-alpha signup)

---

### US-5.5 — Polychrome highlight on node creation `P2` 🔲

**As a** new user,  
**I want** a celebratory polychrome animation when my node is created,  
**So that** joining the network feels special and on-brand.

**Acceptance criteria**
- [ ] First signup triggers rainbow/polychrome burst on the graph
- [ ] Effect uses existing `PolychromeFX` system
- [ ] Skippable; does not block signup completion

---

## Epic 7: Contact Lists

### US-6.1 — Create and manage contact lists `P1` 🔲

**As a** node owner,  
**I want** to create named lists of contacts,  
**So that** I can organize my network for invites and privacy.

**Acceptance criteria**
- [ ] CRUD for contact lists (create, rename, delete)
- [ ] Add/remove Hypernet users to a list by search
- [ ] Lists usable for event invites (US-3.4) and privacy (US-1.4)

---

## Epic 8: Visual Identity & Themes

### US-7.1 — Switch between Light and Dark mode `P0` 🟡

**As a** user,  
**I want** to toggle between light and dark themes,  
**So that** the app is comfortable in different environments.

**Acceptance criteria**
- [x] Light mode: black on white with chrome accents
- [x] Dark mode: white on black with chrome accents
- [x] Preference persisted across sessions
- [ ] All new screens (profile, events, graph) respect theme tokens

*Partially done — theme system exists in `ui.tsx`; extend to new screens.*

---

### US-7.2 — Enable Polychrome mode `P0` 🟡

**As a** user,  
**I want** to activate Polychrome mode,  
**So that** I can experience the holographic/rainbow brand aesthetic.

**Acceptance criteria**
- [x] Polychrome toggle exists
- [x] Rainbow holographic effect applied globally
- [ ] Effect remains performant on mobile
- [ ] Polychrome used intentionally on Admin role badges and highlight moments

*Partially done — `PolychromeFX.tsx` exists; extend to role badges and signup celebration.*

---

### US-7.3 — Consistent retro-futuristic UI `P0` 🔲

**As a** user,  
**I want** every screen to feel cohesive (CRT lines, monospace, chrome frame),  
**So that** Hypernet has a distinct, high-end identity.

**Acceptance criteria**
- [ ] All screens use `TerminalFrame` or equivalent chrome shell
- [ ] CRT scanline overlay available (optional toggle)
- [ ] No off-brand UI components (default browser forms, unstyled modals)
- [ ] Screen space used efficiently — no clutter from unused controls

---

## Epic 9: Profile & Event Customization (Future)

### US-8.1 — Customize my profile page `P2` 🔲

**As a** creative node,  
**I want** to customize my profile layout and expression,  
**So that** my page reflects my personality (MySpace-style).

**Acceptance criteria**
- [ ] TBD — future scope
- [ ] At minimum: custom accent color or header image

---

### US-8.2 — Play music on my profile `P2` 🔲

**As a** profile owner with Spotify Premium,  
**I want** visitors to play my selected music through a native Hypernet player,  
**So that** my profile is a creative expression without ugly Spotify embeds.

**Acceptance criteria**
- [ ] Link Spotify account to Hypernet profile
- [ ] Select playlist or track for profile
- [ ] Visitor sees minimal player controls (play/pause/next/prev)
- [ ] Full playback requires visitor Spotify Premium (or SoundCloud alternative)
- [ ] No 30-second preview limitation; no default Spotify embed widget

---

## Story Map (Priority Overview)

```
PHASE 1 — MVP Foundation
├── US-1.1  Fast node creation          P0
├── US-1.6  Contextual copy             P0
├── US-1.2  Edit profile                P0
├── US-1.3  Profile visibility          P0
├── US-2.1  Skill search                P0
├── US-2.3  Chronicle                   P0
├── US-3.0  Create group                P0
├── US-3.0b Admin a group               P0
├── US-3.0c View group page             P0
├── US-3.1  Create event                P0
├── US-3.2  Add past events             P0
├── US-3.3  Participation roles         P0
├── US-4.1  Publish horizon             P0
├── US-4.1b Admin a horizon             P0
├── US-4.2  Subscribe to horizon        P0
├── US-5.1  Graph explore               P0
├── US-5.2  Graph event filter          P0
├── US-5.3  Graph interaction           P0
├── US-7.1  Light/Dark theme            P0  🟡
├── US-7.2  Polychrome mode             P0  🟡
└── US-7.3  Consistent UI               P0

PHASE 2 — Discovery & Lists
├── US-4.3  Search events               P1
├── US-1.4  Granular privacy            P1
├── US-3.4  Invite contact lists        P1
├── US-5.4  Graph city filter           P1
├── US-6.1  Contact lists               P1
└── US-2.2  Skills taxonomy             P1

PHASE 3 — Future
├── US-1.5  AI profile                  P2
├── US-3.5  Tiered media access         P2
├── US-3.6  Ticketing                   P2
├── US-5.5  Polychrome signup           P2
├── US-8.1  Profile customization       P2
└── US-8.2  Profile music               P2
```

---

## Definition of Done (All Stories)

A user story is **done** when:

1. Acceptance criteria are met on desktop and mobile
2. Feature respects active theme (Light / Dark / Polychrome)
3. Privacy rules enforced server-side (not UI-only)
4. Non-obvious concepts include a user-facing one-liner (see PROJECT_PLAN.md §1)
5. No regression to existing signup terminal flow until intentionally replaced

---

*Last updated: Aug 2026 — derived from product vision voice notes.*
