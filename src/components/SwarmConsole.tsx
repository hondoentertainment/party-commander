import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Shield, Zap, Heart, Music, CheckCircle2 } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { runSwarmAnalysis, type AgentResponse, type AgentRole } from '../services/swarm'
import { useParty } from '../state/PartyContext'
import { cn } from './ui/utils'

const ROLE_ICONS: Record<AgentRole, any> = {
    Logistician: Shield,
    Visualizer: Sparkles,
    Socialite: Heart,
    VibeGuard: Music,
}

const ROLE_COLORS: Record<AgentRole, string> = {
    Logistician: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    Visualizer: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    Socialite: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    VibeGuard: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
}

export function SwarmConsole() {
    const { state } = useParty()
    const [loading, setLoading] = useState(false)
    const [agents, setAgents] = useState<AgentResponse[] | null>(null)

    const handleConsult = async () => {
        setLoading(true)
        const results = await runSwarmAnalysis(state)
        setAgents(results)
        setLoading(false)
    }

    return (
        <Card className="border-white/5 bg-slate-900/50 p-6 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute -top-24 -right-24 size-64 bg-emerald-500/10 blur-[100px]" />

            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-[1.5rem] bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Zap className="size-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Swarm Command</h3>
                        <p className="text-xs text-slate-400">Collaborative Multi-Agent Intelligence</p>
                    </div>
                </div>
                <Button
                    onClick={handleConsult}
                    disabled={loading}
                    className="rounded-2xl border-white/5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                    {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                    {agents ? 'Refine Strategy' : 'Initialize Consultant Team'}
                </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                <AnimatePresence mode="popLayout">
                    {agents ? (
                        agents.map((agent) => {
                            const Icon = ROLE_ICONS[agent.role]
                            return (
                                <motion.div
                                    key={agent.role}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex flex-col rounded-3xl border p-5 transition-all",
                                        ROLE_COLORS[agent.role]
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl bg-white/5">
                                            <Icon className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-widest">{agent.role}</h4>
                                            <p className="text-[10px] opacity-70">Agent: {agent.name}</p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                        "{agent.message}"
                                    </p>

                                    <div className="mt-auto space-y-2">
                                        {agent.actionable?.map((action, i) => (
                                            <div key={i} className="flex items-start gap-2 group cursor-pointer">
                                                <CheckCircle2 className="size-3 mt-0.5 opacity-40 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                                                <span className="text-[10px] leading-tight text-slate-400 group-hover:text-white transition-colors">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-48 rounded-3xl border border-white/5 bg-white/5 animate-pulse" />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
