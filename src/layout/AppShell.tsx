import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function AppShell() {
  const online = useOnlineStatus()

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="hidden min-h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
                Party Command Center
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Plan, run, and wrap.</h2>
              <p className="text-sm text-slate-300">All modules sync in real time.</p>
            </div>
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-200">
              Live Preview
            </div>
          </div>
        </header>
        <main className="px-6 py-8">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/60 backdrop-blur-xl md:hidden">
        <Navigation layout="bottom" />
      </div>
    </div>
  )
}
