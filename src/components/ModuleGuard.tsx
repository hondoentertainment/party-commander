import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useParty } from '../state/PartyContext'
import { MODULES, type ModuleId } from '../config/modules'

const pathToModuleId = (path: string): ModuleId | null => {
  const mod = MODULES.find((m) => m.to === path)
  return mod?.id ?? null
}

const normalizeModulePath = (pathname: string): string => {
  const eventScopedPath = pathname.replace(/^\/event\/[^/]+/, '')
  return eventScopedPath || '/'
}

export function ModuleGuard() {
  const { state } = useParty()
  const { pathname } = useLocation()

  const moduleId = pathToModuleId(normalizeModulePath(pathname))
  if (!moduleId) return <Outlet />

  const enabled = state.admin.modules[moduleId] !== false
  if (!enabled) return <Navigate to="/" replace />

  return <Outlet />
}
