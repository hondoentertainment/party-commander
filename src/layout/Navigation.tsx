import { NavLink, useMatch } from 'react-router-dom'
import { MODULES } from '../config/modules'
import { useParty } from '../state/PartyContext'
import { isAdminEmail } from '../utils/admin'

function isModuleEnabled(modules: Record<string, boolean>, id: string): boolean {
  return modules[id] !== false
}

function NavItem({
  item,
  layout,
}: {
  item: (typeof MODULES)[0]
  layout: 'sidebar' | 'bottom'
}) {
  const Icon = item.icon
  const match = useMatch({ path: item.to, end: item.to === '/' })
  return (
          <NavLink
            key={item.id}
            to={item.to}
            aria-current={match ? 'page' : undefined}
            className={[
              'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-sm font-semibold transition md:flex-row md:gap-2 md:min-h-0 md:min-w-0',
              match
                ? 'bg-emerald-500/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white',
              layout === 'bottom' ? 'flex-1' : '',
              layout === 'sidebar' ? 'md:min-h-0 md:min-w-0' : '',
            ].join(' ')}
          >
            <Icon size={18} aria-hidden />
            {layout === 'sidebar' ? (
              <span>{item.label}</span>
            ) : (
              <span className="text-[10px]">{item.label}</span>
            )}
          </NavLink>
  )
}

export function Navigation({ layout }: { layout: 'sidebar' | 'bottom' }) {
  const { state } = useParty()
  const isAdmin = isAdminEmail(state.auth.user?.email)
  const navItems = MODULES.filter((m) => {
    if (m.id === 'admin') return isAdmin && isModuleEnabled(state.admin.modules, m.id)
    return isModuleEnabled(state.admin.modules, m.id)
  })

  return (
    <nav
      aria-label="Main navigation"
      className={
        layout === 'sidebar'
          ? 'flex flex-col gap-1 px-3 py-4'
          : 'flex items-center justify-between gap-2 px-3 py-2'
      }
    >
      {navItems.map((item) => (
        <NavItem key={item.id} item={item} layout={layout} />
      ))}
    </nav>
  )
}
