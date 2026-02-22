import { NavLink } from 'react-router-dom'
import {
  CalendarClock,
  ClipboardList,
  DoorOpen,
  Home,
  MapPin,
  Music2,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wand2,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/invites', label: 'Invites', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarClock },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/drinks', label: 'Drinks', icon: Sparkles },
  { to: '/decor', label: 'Decor', icon: Wand2 },
  { to: '/cleaning', label: 'Cleaning', icon: ClipboardList },
  { to: '/timeline', label: 'Timeline', icon: CalendarClock },
  { to: '/music', label: 'Music', icon: Music2 },
  { to: '/games', label: 'Games', icon: Sparkles },
  { to: '/venue', label: 'Venue', icon: MapPin },
  { to: '/entry', label: 'Entry', icon: DoorOpen },
  { to: '/live', label: 'Live', icon: Sparkles },
  { to: '/post-party', label: 'Wrap', icon: ClipboardList },
]

export function Navigation({ layout }: { layout: 'sidebar' | 'bottom' }) {
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
            key={item.to}
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
