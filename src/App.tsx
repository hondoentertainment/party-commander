import './App.css'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { ModuleGuard } from './components/ModuleGuard'
import { AdminPage } from './pages/AdminPage'
import { Dashboard } from './pages/Dashboard'
import {
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
  PostPartyPage,
  TimelinePage,
  VenuePage,
} from './pages/ModulePages'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<ModuleGuard />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/invites" element={<InvitesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/menu" element={<MenuPage />} />
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
        </Route>
      </Route>
    </Routes>
  )
}

export default App
