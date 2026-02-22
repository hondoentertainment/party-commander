import './App.css'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import {
  CleaningPage,
  DecorPage,
  DrinksPage,
  EventsPage,
  EntryPage,
  GamesPage,
  InvitesPage,
  LivePage,
  MenuPage,
  MusicPage,
  PostPartyPage,
  TimelinePage,
  VenuePage,
} from './pages/ModulePages'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invites" element={<InvitesPage />} />
        <Route path="/events" element={<EventsPage />} />
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
        <Route path="/post-party" element={<PostPartyPage />} />
      </Route>
    </Routes>
  )
}

export default App
