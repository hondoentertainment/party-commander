# Party Command Center – Roadmap

## Recommended Next Steps

Prioritized improvements based on the current state of the codebase.

---

### 1. Refactor ModulePages.tsx (Code Health)

`src/pages/ModulePages.tsx` is 4,009 lines and 141 KB — the single largest file in the project. Each module page (Budget, Drinks, Decor, etc.) is already re-exported from `src/pages/modules/`, but the implementations all live in one monolithic file.

**Action:** Extract each module's component into its own file under `src/pages/modules/`. This will improve editor performance, make diffs reviewable, and let contributors work on modules independently without merge conflicts.

---

### 2. Increase Test Coverage

The app has ~10,000 lines of source code but only ~370 lines of tests (~3.7% coverage). Critical paths that lack tests:

- **PartyContext reducer** – state transitions, local-first fallback, Supabase sync
- **Auth flows** – sign-up, magic link, password reset, session restoration
- **Services layer** – `parties.ts`, `events.ts`, `collaborators.ts`
- **Module pages** – only BudgetPage has tests; the other 17 modules have none
- **E2E** – only smoke tests exist; add happy-path flows for event creation, collaboration invite, and guest RSVP

**Action:** Add unit tests for the reducer and services first (highest leverage), then expand E2E coverage for the main user journeys.

---

### 3. Push Notifications & Reminders

There is no notification system. Party hosts and collaborators have no way to receive reminders about upcoming tasks, restock alerts, or event countdowns.

**Action:** Integrate Web Push (via service worker + Supabase Edge Functions or a provider like OneSignal) to send:
- Task deadline reminders (Timeline module)
- Restock alerts (Live module)
- Day-of-event countdown nudges

---

### 4. Photo & Media Upload

The Photo/Video module supports a local gallery and download, but there is no cloud upload. Photos taken at events stay on the device.

**Action:** Add Supabase Storage integration so party members can upload, share, and browse event photos in a shared album. Include image compression on upload and thumbnail generation.

---

### 5. Expense Splitting & Settlements

The Budget module tracks expenses by category but has no way to split costs among collaborators or track who has paid.

**Action:** Add per-item assignees, a "split evenly" option, and a settlement summary showing who owes whom. Consider Venmo/Zelle deep-link support for quick payments.

---

### 6. Calendar Integration

The Timeline module shows a days-to-event countdown but doesn't connect to external calendars.

**Action:** Add "Add to Calendar" buttons that generate `.ics` files or deep-link to Google Calendar / Outlook. Optionally, sync tasks as calendar events.

---

### 7. Offline / PWA Support

The app already has a local-first fallback for event creation. Going further with a full Progressive Web App would improve the mobile experience significantly.

**Action:** Add a service worker (via `vite-plugin-pwa`), a web app manifest, and offline caching so the app is installable and fully usable without connectivity.

---

### 8. Accessibility Audit

The app has a skip link and basic ARIA labels, but a full audit has not been done.

**Action:** Run Lighthouse and axe-core audits. Fix any issues with color contrast, focus management, keyboard navigation, and screen reader announcements — especially in modals, the sidebar, and drag-based interactions.

---

## Future Phases

### Phase: Swarm Command

**Swarm Command** – Collaborative multi-agent intelligence. Autonomous agents (Logistician, Visualizer, Socialite, VibeGuard) analyzing event state and providing high-impact suggestions and quick actions. Each agent specializes in logistics, aesthetics, guest experience, or atmosphere.
