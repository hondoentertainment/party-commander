import { NavLink } from 'react-router-dom'
import { MODULES } from '../config/modules'
import { useParty } from '../state/PartyContext'

function isModuleEnabled(modules: Record<string, boolean>, id: string): boolean {
  return modules[id] !== false
}

export function Navigation({ layout }: { layout: 'sidebar' | 'bottom' }) {
  const { state } = useParty()
  const navItems = MODULES.filter((m) => isModuleEnabled(state.admin.modules, m.id))

  return (
    <nav
      className={
        layout === 'sidebar'
          ? 'flex h-full flex-col gap-1 px-3 py-4'
          : 'flex items-center justify-between gap-2 px-3 py-2'
      }
    >
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
                layout === 'bottom' ? 'flex-1 justify-center' : '',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {layout === 'sidebar' && <span>{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}
