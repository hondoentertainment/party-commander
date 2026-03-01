import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Calendar, MapPin, Rocket, ArrowRight, Check } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useParty } from '../state/PartyContext'
import type { Theme } from '../state/types'

const steps = [
    { id: 'name', icon: Rocket, label: 'Designation', sub: 'What is this mission called? (e.g. Neon Horizon)' },
    { id: 'date', icon: Calendar, label: 'Temporal', sub: 'When does reality shift? (Date & Time)' },
    { id: 'theme', icon: Sparkles, label: 'Aesthetic', sub: 'What is the visual protocol? (Party Theme)' },
    { id: 'location', icon: MapPin, label: 'Coordinates', sub: 'Where is the physical hub? (Location)' },
]

export function OnboardingWizard() {
    const { state, dispatch, createParty, partyProfile, parties } = useParty()
    const [currentStep, setCurrentStep] = useState(0)
    const [creating, setCreating] = useState(false)

    // Show when: no party yet (new user or no parties created)
    if (partyProfile && parties && parties.length > 0) return null

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleFinish = async () => {
        if (!state.core.name) {
            dispatch({ type: 'update_core', payload: { name: 'Untethered Soirée' } })
        }
        if (partyProfile) {
            setCreating(true)
            try {
                await createParty()
            } finally {
                setCreating(false)
            }
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-3xl px-6">
            <div className="glow-orb scale-150 opacity-20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-emerald-500/20 bg-black/40 p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex gap-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i === currentStep ? 'bg-emerald-500 w-24' : i < currentStep ? 'bg-emerald-500/40' : 'bg-white/5'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step {currentStep + 1} of 4</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="flex size-16 items-center justify-center rounded-[2rem] bg-emerald-500/10">
                                    {(() => {
                                        const Icon = steps[currentStep].icon
                                        return <Icon className="size-8 text-emerald-400" />
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{steps[currentStep].label} Protocol</h2>
                                    <p className="text-slate-400">{steps[currentStep].sub}</p>
                                </div>
                            </div>

                            <div className="min-h-[100px]">
                                {currentStep === 0 && (
                                    <Input
                                        autoFocus
                                        value={state.core.name}
                                        onChange={(e) => dispatch({ type: 'update_core', payload: { name: e.target.value } })}
                                        placeholder="e.g. Neon Horizon"
                                        className="text-2xl font-bold rounded-2xl border-white/10 bg-black/20 focus:bg-black/40 h-20 px-8"
                                    />
                                )}
                                {currentStep === 1 && (
                                    <Input
                                        type="datetime-local"
                                        value={state.core.date}
                                        onChange={(e) => dispatch({ type: 'update_core', payload: { date: e.target.value } })}
                                        className="text-xl rounded-2xl border-white/10 bg-black/20 h-20 px-8"
                                    />
                                )}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Classic', 'Rooftop', 'Tropical', 'Disco', 'Game Night', 'Cozy'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => dispatch({ type: 'update_core', payload: { theme: t as Theme } })}
                                                className={`rounded-2xl border p-4 text-left transition-all ${state.core.theme === t
                                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-sm font-bold uppercase tracking-widest">{t}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {currentStep === 3 && (
                                    <Input
                                        value={state.core.location}
                                        onChange={(e) => dispatch({ type: 'update_core', payload: { location: e.target.value } })}
                                        placeholder="Enter physical coordinates..."
                                        className="text-xl rounded-2xl border-white/10 bg-black/20 h-20 px-8"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end pt-8">
                                {currentStep < steps.length - 1 ? (
                                    <Button size="lg" onClick={next} className="rounded-2xl px-12 group">
                                        Next Step
                                        <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button size="lg" onClick={handleFinish} disabled={creating} className="rounded-2xl px-12 bg-emerald-500 text-black hover:bg-emerald-400 shadow-xl shadow-emerald-500/20">
                                        {creating ? 'Creating party…' : 'Deploy intelligence'}
                                        <Check className="size-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    )
}
