import { Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigation } from './Navigation'
import { PartySwitcher } from '../components/PartySwitcher'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useParty } from '../state/PartyContext'
import { User, Wifi, WifiOff } from 'lucide-react'

export function AppShell() {
  const { online, syncing } = useOnlineStatus()
  const { state, partyProfile } = useParty()
  const location = useLocation()
  const user = state.auth.user as {
    user_metadata?: { avatar_url?: string; full_name?: string }
  } | null

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:block focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:p-4 focus:py-2"
      >
        Skip to main content
      </a>

      {/* Sidebar — desktop */}
      <div
        className="hidden h-screen min-h-0 border-r border-white/[0.06] bg-black/50 backdrop-blur-2xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:overflow-hidden"
        aria-label="Sidebar"
      >
        <div className="shrink-0 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/10">
              <span className="text-lg font-black text-emerald-400">⚡</span>
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent blur-sm" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Party Commander
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400/60">
                Command Center
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto sidebar-scroll">
          <Navigation layout="sidebar" />
        </div>

        {/* Sidebar footer — connection status */}
        <div className="shrink-0 border-t border-white/5 px-6 py-4">
          <div className="flex items-center gap-2">
            {online ? (
              <>
                <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  {syncing ? 'Syncing…' : 'Connected'}
                </span>
              </>
            ) : (
              <>
                <div className="size-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Offline
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72">
        {/* Status banners */}
        <AnimatePresence>
          {!online && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-amber-400/20 bg-amber-500/10"
            >
              <div className="flex items-center gap-2 px-6 py-2 text-sm text-amber-200">
                <WifiOff size={14} />
                Offline mode — changes stay on device.
              </div>
            </motion.div>
          )}
          {online && syncing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-emerald-400/20 bg-emerald-500/10"
            >
              <div className="flex items-center gap-2 px-6 py-2 text-sm text-emerald-200">
                <Wifi size={14} className="animate-pulse" />
                Back online — syncing changes…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="relative overflow-hidden border-b border-white/[0.06] bg-black/20 px-6 py-5 backdrop-blur-2xl">
          {/* Ambient glow effects */}
          <div className="glow-orb" />
          <div className="glow-sweep" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400/70">
                Party Command Center
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Plan, run, and wrap.
              </h2>
              <p className="mt-0.5 text-sm font-medium text-slate-400">
                {partyProfile
                  ? `${partyProfile.name} — synced`
                  : 'Data saved locally in your browser.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PartySwitcher />
              <Link
                to="/profile"
                className="group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                aria-label="Open profile"
              >
                <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10 transition-all group-hover:ring-emerald-500/30">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <User className="size-5 text-slate-500" />
                  )}
                </div>
                <span className="hidden text-sm font-medium md:inline">
                  {user?.user_metadata?.full_name ?? 'Profile'}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content with route transitions */}
        <main id="main-content" className="px-6 pt-8 pb-24 md:pb-8" role="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-black/80 backdrop-blur-2xl pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        <Navigation layout="bottom" />
      </div>
    </div>
  )
}
