# Party Command Center – Feature Roadmap

**Audit date:** March 10, 2025  
**Last updated:** March 10, 2025 (post-implementation)  
**Stack:** React, Vite, Supabase (auth + data: `parties`, `party_events`, `party_profile`, etc.)  
**Structure:** Global routes (`/`, `/admin`, `/profile`, `/events`) + event-scoped routes (`/event/:eventId/*`)

---

## 0. Recently Completed (March 2025)

| Item | Status |
|------|--------|
| Timeline task status toggle | Done – status dropdown per task in `TimelinePage.tsx` |
| Auth env validation | Done – `validateSupabaseConfig()` in `auth.ts` |
| AI budget optimization | Done – "Optimize with AI" button in Budget; calls `generateBudgetOptimization` |
| Error toasts for sync | Done – PartyContext shows toasts on PartyService/EventService failure |
| Decor inline edit | Done – Edit button, pre-filled form, save/cancel |
| Cleaning phase checklists | Done – Before/During/After sections, status cycling, add/remove items |
| E2E expansion | Done – `e2e/invite-events-leads-drinks.spec.ts` |
| Unit tests (Events, Invites, Drinks) | Done – `__tests__/EventsPage`, `InvitesPage`, `DrinksPage` |
| Module split (TimelinePage) | Done – `src/pages/modules/TimelinePage.tsx` extracted (~450 lines from ModulePages) |

---

## 1. Summary Table

| Module       | Route / Path           | Status   | Completeness | UI | State | Persistence | Tests |
|--------------|------------------------|----------|--------------|-----|-------|-------------|-------|
| home         | `/`, `/event/:id`      | Shipped  | 95%          | ✓   | ✓     | localStorage + Supabase | E2E |
| plan         | `/plan`                | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| timeline     | `/timeline`            | Partial  | 85%          | ✓   | ✓     | ✓           | —    |
| budget       | `/budget`              | Shipped  | 100%         | ✓   | ✓     | ✓           | Unit + E2E |
| invites      | `/invites`             | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| events       | `/events`              | Shipped  | 100%         | ✓   | ✓     | ✓           | E2E |
| leads        | `/leads`               | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| food         | `/food`                | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| drinks       | `/drinks`              | Shipped  | 100%         | ✓   | ✓     | ✓           | Unit (engines) |
| decor        | `/decor`               | Partial  | 80%          | ✓   | ✓     | ✓           | —    |
| cleaning     | `/cleaning`            | Partial  | 70%          | ✓   | ✓     | ✓           | —    |
| music        | `/music`               | Shipped  | 95%          | ✓   | ✓     | ✓           | —    |
| games        | `/games`               | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| venue        | `/venue`               | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| entry        | `/entry`               | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| live         | `/live`                | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| photo_video  | `/photo-video`         | Shipped  | 95%          | ✓   | ✓     | ✓           | —    |
| post_party   | `/post-party`          | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |
| admin        | `/admin`               | Shipped  | 100%         | ✓   | ✓     | ✓           | —    |

---

## 2. Shipped Features Status

### 2.1 Routes and Wiring

All module routes are defined in `src/App.tsx` (lines 60–93) and wrapped by:

- `AuthGate` – auth/sign-in
- `ModuleGuard` – respects admin-disabled modules
- `EventScopeGuard` – loads/switches party on event-scoped routes

Event-scoped modules use `/event/:eventId/<module>` (e.g. `/event/:eventId/budget`).  
Global routes: `/`, `/admin`, `/profile`, `/events`.  
Events: `/events` redirects to `/event/:currentPartyId/events` when a party is active.

### 2.2 UI Components

All module pages live in `src/pages/ModulePages.tsx` (single ~4,010-line file). Each module exports its page component:

- `BudgetPage`, `PlanPage`, `InvitesPage`, `EventsPage`, `LeadsPage`, `MenuPage`
- `DrinksPage`, `DecorPage`, `CleaningPage`, `TimelinePage`, `MusicPage`, `GamesPage`
- `VenuePage`, `EntryPage`, `LivePage`, `PhotoVideoPage`, `PostPartyPage`

Shared UI: `Card`, `Input`, `Select`, `Textarea`, `Button`, `ConfirmDialog`, `Badge`, `AnimatedList`, `SectionHeader`, etc. in `src/components/ui/` and `src/components/`.

### 2.3 State and Types

`src/state/types.ts` defines:

- Party state: core, invites, budget, events, leads, menu, drinks, decor, cleaning, timeline, music, games, venue, entry, live, postParty, photoVideo, admin
- Subtypes: `MenuItem`, `DrinkSuggestion`, `DecorItem`, `CleaningChecklist`, `TimelineTask`, `Game`, `Amenity`, `PhotoVideoShot`, `GalleryPhoto`, etc.

State is managed in `PartyContext.tsx` with a reducer and `update_*` actions.  
Theme-based drink suggestions and timeline defaults come from `src/state/engines.ts`.

### 2.4 Persistence

**LocalStorage (always):**

- `party-command-center` – full party state (via `src/state/storage.ts`)
- `party-command-center-last-party`
- `party-command-center-local-parties` – offline parties
- `party-command-center-hidden-from-home`

**Supabase (when logged in):**

- `parties` – party profile + JSON state
- `party_events` – events list (via `EventService`)
- `party_profile` – user profile
- `party_collaborators` – sharing
- `party_invite_tokens` – invite links

`PartyContext` saves to both: localStorage on every state change; Supabase on debounce (1s) for the current party when authenticated.

### 2.5 Tests

| Test                         | Type   | Location                               |
|------------------------------|--------|----------------------------------------|
| Budget page render / add     | Unit   | `src/pages/__tests__/BudgetPage.test.tsx` |
| Budget remove confirmation   | Unit   | `src/pages/__tests__/BudgetPageConfirm.test.tsx` |
| ConfirmDialog                | Unit   | `src/components/ui/__tests__/ConfirmDialog.test.tsx` |
| Navigation                   | Unit   | `src/layout/__tests__/Navigation.test.tsx` |
| Engines (drinks, timeline)   | Unit   | `src/state/engines.test.ts`            |
| Smoke (home, budget, skip)    | E2E    | `e2e/smoke.spec.ts`                    |
| Production smoke (guest flow)| E2E    | `e2e/smoke-prod.spec.ts`               |

---

## 3. Gaps and Partial Features

### ~~3.1 Timeline – Task Status Toggle~~ ✅ Done

**Resolved:** Status dropdown added in `src/pages/modules/TimelinePage.tsx`.

### ~~3.2 Decor – No Inline Editing~~ ✅ Done

**Resolved:** Edit button and pre-filled form added.

### ~~3.3 Cleaning – Checklists Not Implemented~~ ✅ Done

**Resolved:** Phase-based checklists (Before/During/After) with status cycling.

### ~~3.4 AI Budget Optimization – Not Wired~~ Done

**Resolved:** Optimize with AI button in Budget page.

### ~~3.5 Auth Placeholder Fallbacks~~ Done

**Resolved:** `validateSupabaseConfig()` runs on load and warns when placeholders are used.

### ~~3.6 Limited Error Handling / User Feedback~~ Done

**Resolved:** Error toasts in PartyContext on PartyService/EventService failure.

---

## 4. Prioritized Recommendations

### 4.1 Immediate (Fix Regressions / Critical UX)

| Item                         | Rationale                                                                 |
|------------------------------|----------------------------------------------------------------------------|
| Add task status toggle (Timeline) | Tasks have status, but users cannot mark them done, breaking prep tracking |
| Auth env validation          | Fail fast when Supabase config is missing instead of using placeholders   |

### 4.2 Next Release (Highest Impact)

| Item                                | Rationale                                                                    |
|-------------------------------------|-------------------------------------------------------------------------------|
| Wire AI budget optimization        | Feature exists; add "Get AI tips" in Budget, call `generateBudgetOptimization` |
| Decor inline edit                   | Users can add but not edit; inline edit improves workflow                     |
| Cleaning checklists (phase-based)  | Types and defaults are in place; add before/during/after checklist UI          |
| Error toasts for sync failures      | Give feedback when Supabase sync fails instead of failing silently            |

### 4.3 Technical Debt

| Item                    | Rationale                                                                 |
|-------------------------|----------------------------------------------------------------------------|
| Split ModulePages.tsx   | ~4,000 lines; split into `src/pages/modules/<Module>Page.tsx` per module  |
| Broader E2E coverage    | Add E2E for invite redemption, Events CRUD, Leads, Drinks                  |
| Unit tests for modules  | Only Budget has solid coverage; add tests for Events, Invites, Drinks      |

### 4.4 Prospective (Future)

| Item                     | Notes                                                         |
|--------------------------|---------------------------------------------------------------|
| Photo gallery sync       | Photos stored as base64 in state; consider Storage/Cloudinary |
| Live restock alerts      | ✅ Realtime: Supabase Realtime subscription merges co-host restock alerts; toast on remote changes |
| Web Push for restock     | Future: Web Push API + Supabase Edge Function for off-tab notifications |
| Music "Spotify Hub"      | Button is non-functional; could integrate Spotify API         |

---

## 5. File Reference Quick Index

| Area              | Key files                                                                 |
|-------------------|---------------------------------------------------------------------------|
| Routing           | `src/App.tsx`                                                            |
| Module config     | `src/config/modules.tsx`                                                 |
| Module pages      | `src/pages/ModulePages.tsx`                                             |
| State / types     | `src/state/PartyContext.tsx`, `types.ts`, `defaults.ts`, `engines.ts`    |
| Persistence       | `src/state/storage.ts`, `src/services/parties.ts`, `events.ts`           |
| Auth / share      | `src/services/auth.ts`, `collaborators.ts`                              |
| AI                | `src/services/ai.ts`                                                     |
| Guards            | `src/components/EventScopeGuard.tsx`, `ModuleGuard.tsx`                  |
| Layout            | `src/layout/AppShell.tsx`, `Navigation.tsx`                             |

---

## 6. Module Notes

- **Events:** Per-event leads, tasks, and menu; copy-from-event and copy-from-party; EventService syncs to `party_events`.
- **Drinks:** Theme engine (`engines.ts`) drives suggestions; shopping list from guest count; custom drinks, overrides, quantities.
- **Invites:** Partiful link, templates, share kit, host brief; CollaboratorService and InvitePage for party sharing.
- **Photo/Video:** Shots, equipment, base64 gallery; images resized to 1200px max before storage.
- **Live:** Restock alerts (ice, cups, mixers, trash) and quick notes; read-only "Now Playing" from music state. Supabase Realtime syncs restock alerts to co-hosts; toast "Co-host marked X needs restocking" on remote toggle.