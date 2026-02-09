import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function AppShell() {
  const online = useOnlineStatus()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden min-h-screen border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="px-6 py-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Party Command Center</p>
          <h1 className="text-lg font-semibold text-slate-900">Host Dashboard</h1>
        </div>
        <Navigation layout="sidebar" />
      </div>

      <div className="md:pl-64">
        {!online ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-700">
            Offline mode: changes will sync locally.
          </div>
        ) : null}
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Plan, run, and wrap.</h2>
          <p className="text-sm text-slate-500">Everything stays in sync across modules.</p>
        </header>
        <main className="px-6 py-6">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white md:hidden">
        <Navigation layout="bottom" />
      </div>
    </div>
  )
}
