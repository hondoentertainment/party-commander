import { Outlet, Link } from 'react-router-dom'
import { Navigation } from './Navigation'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useParty } from '../state/PartyContext'
import { User } from 'lucide-react'

export function AppShell() {
  const online = useOnlineStatus()
  const { state } = useParty()
  const user = state.auth.user as { user_metadata?: { avatar_url?: string; full_name?: string } } | null

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:block focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:p-4 focus:py-2"
      >
        Skip to main content
      </a>
      <div className="hidden min-h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col" aria-label="Sidebar">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Party Command Center</p>
          <h1 className="text-2xl font-semibold text-white">Host Command</h1>
          <p className="mt-2 text-sm text-slate-300">
            Design the vibe. Orchestrate the flow.
          </p>
        </div>
        <Navigation layout="sidebar" />
      </div>

      <div className="md:pl-72">
        {!online ? (
          <div className="border-b border-amber-400/30 bg-amber-500/10 px-6 py-2 text-sm text-amber-200">
            Offline mode enabled. Changes stay on device.
          </div>
        ) : null}
        <header className="relative overflow-hidden border-b border-white/10 bg-black/30 px-6 py-6 backdrop-blur-xl">
          <div className="glow-orb" />
          <div className="glow-sweep" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
                Party Command Center
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Plan, run, and wrap.</h2>
              <p className="text-sm text-slate-300">Data saved locally in your browser.</p>
            </div>
            <Link
              to="/profile"
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Open profile"
            >
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/10">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <User className="size-5 text-slate-400" />
                )}
              </div>
              <span className="hidden text-sm font-medium md:inline">
                {user?.user_metadata?.full_name ?? 'Profile'}
              </span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="px-6 py-8" role="main">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/60 backdrop-blur-xl md:hidden">
        <Navigation layout="bottom" />
      </div>
    </div>
  )
}
