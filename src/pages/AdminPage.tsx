import { useParty } from '../state/PartyContext'
import { MODULES, type ModuleId } from '../config/modules'
import { Card, CardTitle } from '../components/ui/Card'

function isModuleEnabled(modules: Record<string, boolean>, id: ModuleId): boolean {
  return modules[id] !== false
}

export function AdminPage() {
  const { state, dispatch } = useParty()
  const { modules } = state.admin

  const toggleModule = (id: ModuleId, enabled: boolean) => {
    dispatch({
      type: 'update_admin',
      payload: {
        modules: { ...modules, [id]: enabled },
      },
    })
  }

  const toggleableModules = MODULES.filter((m) => m.canDisable)
  const alwaysOnModules = MODULES.filter((m) => !m.canDisable)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Module Admin</h3>
      <p className="text-sm text-slate-300">
        Turn modules on or off to customize your party planning experience. Disabled modules are
        hidden from navigation.
      </p>

      <Card>
        <CardTitle>Modules</CardTitle>
        <div className="mt-4 space-y-3">
          {toggleableModules.map((mod) => {
            const enabled = isModuleEnabled(modules, mod.id)
            const Icon = mod.icon
            return (
              <div
                key={mod.id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-slate-400" />
                  <span className="font-medium text-white">{mod.label}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => toggleModule(mod.id, !enabled)}
                  className={[
                    'relative h-7 w-12 shrink-0 rounded-full transition',
                    enabled ? 'bg-emerald-500/60' : 'bg-white/10',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
                      enabled ? 'left-7 translate-x-[-100%]' : 'left-1',
                    ].join(' ')}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Always visible</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          These modules cannot be disabled and are always shown in navigation.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {alwaysOnModules.map((mod) => {
            const Icon = mod.icon
            return (
              <li key={mod.id} className="flex items-center gap-2">
                <Icon size={16} className="text-slate-500" />
                {mod.label}
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
