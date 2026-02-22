import {
  CalendarClock,
  Camera,
  ClipboardList,
  DollarSign,
  DoorOpen,
  Home,
  MapPin,
  Music2,
  Settings,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wand2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ModuleId =
  | 'home'
  | 'budget'
  | 'invites'
  | 'events'
  | 'leads'
  | 'menu'
  | 'drinks'
  | 'decor'
  | 'cleaning'
  | 'timeline'
  | 'music'
  | 'games'
  | 'venue'
  | 'entry'
  | 'live'
  | 'photo_video'
  | 'post_party'
  | 'admin'

export interface ModuleConfig {
  id: ModuleId
  to: string
  label: string
  icon: LucideIcon
  canDisable: boolean
}

export const MODULES: ModuleConfig[] = [
  { id: 'home', to: '/', label: 'Home', icon: Home, canDisable: false },
  { id: 'budget', to: '/budget', label: 'Budget', icon: DollarSign, canDisable: true },
  { id: 'invites', to: '/invites', label: 'Invites', icon: Users, canDisable: true },
  { id: 'events', to: '/events', label: 'Events', icon: CalendarClock, canDisable: true },
  { id: 'leads', to: '/leads', label: 'Leads', icon: Users, canDisable: true },
  { id: 'menu', to: '/menu', label: 'Menu', icon: UtensilsCrossed, canDisable: true },
  { id: 'drinks', to: '/drinks', label: 'Drinks', icon: Sparkles, canDisable: true },
  { id: 'decor', to: '/decor', label: 'Decor', icon: Wand2, canDisable: true },
  { id: 'cleaning', to: '/cleaning', label: 'Cleaning', icon: ClipboardList, canDisable: true },
  { id: 'timeline', to: '/timeline', label: 'Timeline', icon: CalendarClock, canDisable: true },
  { id: 'music', to: '/music', label: 'Music', icon: Music2, canDisable: true },
  { id: 'games', to: '/games', label: 'Games', icon: Sparkles, canDisable: true },
  { id: 'venue', to: '/venue', label: 'Venue', icon: MapPin, canDisable: true },
  { id: 'entry', to: '/entry', label: 'Entry', icon: DoorOpen, canDisable: true },
  { id: 'live', to: '/live', label: 'Live', icon: Sparkles, canDisable: true },
  { id: 'photo_video', to: '/photo-video', label: 'Photo/Video', icon: Camera, canDisable: true },
  { id: 'post_party', to: '/post-party', label: 'Wrap', icon: ClipboardList, canDisable: true },
  { id: 'admin', to: '/admin', label: 'Admin', icon: Settings, canDisable: false },
]

export const MODULE_IDS = MODULES.map((m) => m.id) as ModuleId[]
