import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { ModuleGuard } from './components/ModuleGuard'
import { AdminGuard } from './components/AdminGuard'
import { AuthGate } from './components/AuthGate'
import { AuthCallback } from './pages/AuthCallback'
import { AdminPage } from './pages/AdminPage'
import { InvitePage } from './pages/InvitePage'
import { Dashboard } from './pages/Dashboard'
import { ProfilePage } from './pages/ProfilePage'
import {
  BudgetPage,
  CleaningPage,
  DecorPage,
  DrinksPage,
  EventsPage,
  LeadsPage,
  EntryPage,
  GamesPage,
  InvitesPage,
  LivePage,
  MenuPage,
  MusicPage,
  PhotoVideoPage,
  PlanPage,
  PostPartyPage,
  TimelinePage,
  VenuePage,
} from './pages/ModulePages'

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/invite/party/:token" element={<InvitePage />} />
      <Route element={<AppShell />}>
        <Route element={<AuthGate />}>
          <Route element={<ModuleGuard />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/invites" element={<InvitesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/food" element={<MenuPage />} />
            <Route path="/menu" element={<Navigate to="/food" replace />} />
            <Route path="/drinks" element={<DrinksPage />} />
            <Route path="/decor" element={<DecorPage />} />
            <Route path="/cleaning" element={<CleaningPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/venue" element={<VenuePage />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/photo-video" element={<PhotoVideoPage />} />
            <Route path="/post-party" element={<PostPartyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
