import { useState } from 'react'
import { Sparkles, Loader2, ChevronRight, Wand2 } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { generateThemeSuggestions } from '../services/ai'
import { motion, AnimatePresence } from 'framer-motion'

export function AIAssistant() {
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<any[] | null>(null)
    const [input, setInput] = useState('')

    const handleSuggest = async () => {
        if (!input.trim()) return
        setLoading(true)
        const result = await generateThemeSuggestions(input)
        setSuggestions(result)
        setLoading(false)
    }

    return (
        <Card className="border-emerald-500/10 bg-emerald-500/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Sparkles className="size-5 text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle>Strategy Engine</CardTitle>
                        <CardDescription>Infuse your event with AI-powered creativity.</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <div className="mt-4 space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe the vibe... (e.g. 'Cozy winter rooftop')"
                        className="w-full rounded-2xl border border-white/5 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
                    />
                    <Button
                        size="sm"
                        className="absolute right-2 top-2 rounded-xl"
                        onClick={handleSuggest}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {suggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid gap-3"
                        >
                            {suggestions.map((theme, i) => (
                                <div
                                    key={i}
                                    className="group relative rounded-[1.5rem] border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60"
                                >
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-emerald-400">{theme.name}</h5>
                                        <ChevronRight className="size-4 text-slate-600 group-hover:text-emerald-400" />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">{theme.vibe}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <div className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                                            🍸 {theme.drink}
                                        </div>
                                        <div className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                                            🎯 {theme.activity}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
