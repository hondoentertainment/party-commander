import { useState } from 'react'
import { NavLink, useMatch, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MODULES, type ModuleConfig } from '../config/modules'
import { useParty } from '../state/PartyContext'
import { isAdminEmail } from '../utils/admin'
import { cn } from '../components/ui/utils'
import { MoreHorizontal, X } from 'lucide-react'

function isModuleEnabled(modules: Record<string, boolean>, id: string): boolean {
  return modules[id] !== false
}

/** Group definitions for sidebar navigation */
const SIDEBAR_GROUPS: { label: string; ids: string[] }[] = [
  { label: '', ids: ['home'] },
  {
    label: 'Planning',
    ids: ['plan', 'timeline', 'budget', 'invites', 'events', 'leads'],
  },
  {
    label: 'Logistics',
    ids: ['food', 'drinks', 'decor', 'cleaning', 'venue'],
  },
  {
    label: 'Experience',
    ids: ['music', 'games', 'entry', 'live', 'photo_video', 'post_party'],
  },
  { label: '', ids: ['admin'] },
]

/** Priority items for mobile bottom nav (the rest go in "More") */
const MOBILE_PRIORITY_IDS = ['home', 'timeline', 'budget', 'invites', 'music']

function NavItem({
  item,
  layout,
  onClick,
}: {
  item: ModuleConfig
  layout: 'sidebar' | 'bottom'
  onClick?: () => void
}) {
  const { eventId } = useParams()
  const { currentPartyId } = useParty()
  const Icon = item.icon
  const isGlobal = item.to === '/admin' || item.to === '/profile'
  const activePartyId = eventId ?? currentPartyId
  const homePath = eventId ? `/event/${eventId}` : '/'
  // Events: use /event/:id/events when a party is active, else /events (global fallback)
  const eventsPath = activePartyId ? `/event/${activePartyId}/events` : '/events'
  const toPath = isGlobal
    ? item.to
    : item.id === 'home'
      ? homePath
    : item.id === 'events'
      ? eventsPath
      : activePartyId
        ? `/event/${activePartyId}${item.to === '/' ? '' : item.to}`
        : item.to
  const matchDefault = useMatch({ path: toPath, end: item.to === '/' })
  const matchEvents = useMatch({ path: '/event/:eventId/events', end: true })
  const match = matchDefault || (item.id === 'events' && matchEvents)

  return (
    <NavLink
      key={item.id}
      to={toPath}
      onClick={onClick}
      aria-current={match ? 'page' : undefined}
      className={cn(
        'group relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 md:flex-row md:gap-2.5 md:min-h-0 md:min-w-0',
        match
          ? 'bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white',
        layout === 'bottom' ? 'flex-1' : '',
        layout === 'sidebar' ? 'md:min-h-0 md:min-w-0' : '',
      )}
    >
      <Icon
        size={layout === 'bottom' ? 20 : 18}
        aria-hidden
        className={cn(
          'transition-transform duration-200',
          match && 'scale-110',
        )}
      />
      {layout === 'sidebar' ? (
        <span>{item.label}</span>
      ) : (
        <span className="text-[10px] leading-tight">{item.label}</span>
      )}
      {/* Active indicator dot for sidebar */}
      {match && layout === 'sidebar' && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-emerald-400"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </NavLink>
  )
}

function SidebarNavigation({
  navItems,
}: {
  navItems: ModuleConfig[]
}) {
  const itemMap = new Map(navItems.map((m) => [m.id, m]))

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-3 py-4">
      {SIDEBAR_GROUPS.map((group) => {
        const groupItems = group.ids
          .map((id) => itemMap.get(id))
          .filter(Boolean) as ModuleConfig[]
        if (groupItems.length === 0) return null

        return (
          <div key={group.label || 'ungrouped'} className="mb-1">
            {group.label && (
              <p className="mb-1.5 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                {group.label}
              </p>
            )}
            {groupItems.map((item) => (
              <NavItem key={item.id} item={item} layout="sidebar" />
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function BottomNavigation({
  navItems,
}: {
  navItems: ModuleConfig[]
}) {
  const [moreOpen, setMoreOpen] = useState(false)

  const priorityItems = MOBILE_PRIORITY_IDS.map((id) =>
    navItems.find((m) => m.id === id),
  ).filter(Boolean) as ModuleConfig[]

  const moreItems = navItems.filter(
    (m) => !MOBILE_PRIORITY_IDS.includes(m.id),
  )

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-slate-900/98 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 shadow-2xl backdrop-blur-xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  All Modules
                </p>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {moreItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    layout="bottom"
                    onClick={() => setMoreOpen(false)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between gap-1 px-2 py-1.5"
      >
        {priorityItems.map((item) => (
          <NavItem key={item.id} item={item} layout="bottom" />
        ))}
        {moreItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex flex-1 min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
              moreOpen
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
            aria-label="More modules"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] leading-tight">More</span>
          </button>
        )}
      </nav>
    </>
  )
}

export function Navigation({ layout }: { layout: 'sidebar' | 'bottom' }) {
  const { state, currentPartyId } = useParty()
  const isAdmin = isAdminEmail(state.auth.user?.email)
  const activePartyId = currentPartyId
  const navItems = MODULES.filter((m) => {
    if (m.id === 'admin') return isAdmin && isModuleEnabled(state.admin.modules, m.id)
    if (!activePartyId && !['home', 'events'].includes(m.id)) return false
    return isModuleEnabled(state.admin.modules, m.id)
  })

  if (layout === 'sidebar') {
    return <SidebarNavigation navItems={navItems} />
  }
  return <BottomNavigation navItems={navItems} />
}
