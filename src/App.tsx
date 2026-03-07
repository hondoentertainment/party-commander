import './App.css'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { ModuleGuard } from './components/ModuleGuard'
import { AdminGuard } from './components/AdminGuard'
import { AuthGate } from './components/AuthGate'
import { EventScopeGuard } from './components/EventScopeGuard'
import { useParty } from './state/PartyContext'

const AuthCallback = lazy(() => import('./pages/AuthCallback').then((module) => ({ default: module.AuthCallback })))
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((module) => ({ default: module.ResetPassword })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })))
const InvitePage = lazy(() => import('./pages/InvitePage').then((module) => ({ default: module.InvitePage })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const GlobalDashboard = lazy(() => import('./pages/GlobalDashboard').then((module) => ({ default: module.GlobalDashboard })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const BudgetPage = lazy(() => import('./pages/modules/BudgetPage'))
const CleaningPage = lazy(() => import('./pages/modules/CleaningPage'))
const DecorPage = lazy(() => import('./pages/modules/DecorPage'))
const DrinksPage = lazy(() => import('./pages/modules/DrinksPage'))
const EventsPage = lazy(() => import('./pages/modules/EventsPage'))
const LeadsPage = lazy(() => import('./pages/modules/LeadsPage'))
const EntryPage = lazy(() => import('./pages/modules/EntryPage'))
const GamesPage = lazy(() => import('./pages/modules/GamesPage'))
const InvitesPage = lazy(() => import('./pages/modules/InvitesPage'))
const LivePage = lazy(() => import('./pages/modules/LivePage'))
const MenuPage = lazy(() => import('./pages/modules/MenuPage'))
const MusicPage = lazy(() => import('./pages/modules/MusicPage'))
const PhotoVideoPage = lazy(() => import('./pages/modules/PhotoVideoPage'))
const PlanPage = lazy(() => import('./pages/modules/PlanPage'))
const PostPartyPage = lazy(() => import('./pages/modules/PostPartyPage'))
const TimelinePage = lazy(() => import('./pages/modules/TimelinePage'))
const VenuePage = lazy(() => import('./pages/modules/VenuePage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-500" />
    </div>
  )
}

function GlobalEventsEntry() {
  const { currentPartyId } = useParty()

  if (currentPartyId) {
    return <Navigate to={`/event/${currentPartyId}/events`} replace />
  }

  return <EventsPage />
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/invite/party/:token" element={<InvitePage />} />
        <Route element={<AppShell />}>
          <Route element={<AuthGate />}>
            <Route element={<ModuleGuard />}>
              {/* Global Routes */}
              <Route path="/" element={<GlobalDashboard />} />
              <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events" element={<GlobalEventsEntry />} />

              {/* Event Scoped Routes */}
              <Route path="/event/:eventId" element={<EventScopeGuard />}>
                <Route index element={<Dashboard />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="plan" element={<PlanPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="invites" element={<InvitesPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="food" element={<MenuPage />} />
                <Route path="menu" element={<Navigate to="food" replace />} />
                <Route path="drinks" element={<DrinksPage />} />
                <Route path="decor" element={<DecorPage />} />
                <Route path="cleaning" element={<CleaningPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="music" element={<MusicPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="venue" element={<VenuePage />} />
                <Route path="entry" element={<EntryPage />} />
                <Route path="live" element={<LivePage />} />
                <Route path="photo-video" element={<PhotoVideoPage />} />
                <Route path="post-party" element={<PostPartyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
