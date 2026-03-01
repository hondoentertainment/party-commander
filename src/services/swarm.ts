import { model } from './ai'

export type AgentRole = 'Logistician' | 'Visualizer' | 'Socialite' | 'VibeGuard'

export interface AgentResponse {
    role: AgentRole
    name: string
    message: string
    actionable?: string[]
}

const AGENTS: Record<AgentRole, { name: string; system: string }> = {
    Logistician: {
        name: 'Atlas',
        system: 'You are Atlas, the Logistician. Focus on efficiency, budget compliance, and timeline precision. Be direct and pragmatic.',
    },
    Visualizer: {
        name: 'Lumina',
        system: 'You are Lumina, the Visualizer. Focus on aesthetics, decor themes, and visual impact. Use descriptive, sensory language.',
    },
    Socialite: {
        name: 'Vesper',
        system: 'You are Vesper, the Socialite. Focus on guest experience, outreach, and social dynamics. Be charming and enthusiastic.',
    },
    VibeGuard: {
        name: 'Echo',
        system: 'You are Echo, the Vibe Guard. Focus on music, energy levels, and atmospheric flow. Be cool, rhythmic, and trend-aware.',
    },
}

export async function runSwarmAnalysis(state: any): Promise<AgentResponse[]> {
    const roles: AgentRole[] = ['Logistician', 'Visualizer', 'Socialite', 'VibeGuard']

    const results = await Promise.all(
        roles.map(async (role) => {
            try {
                const prompt = `
          Context: ${JSON.stringify({ core: state.core, budget: state.budget.limit, guestCount: state.invites.guestCount })}
          Role Definition: ${AGENTS[role].system}
          Task: Analyze the current event state and provide one high-impact suggestion and 3 quick actions.
          Return Format: JSON object { "message": "...", "actionable": ["...", "...", "..."] }
        `
                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()
                const jsonMatch = text.match(/\{.*\}/s)
                const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: 'Standby mode active.', actionable: [] }

                return {
                    role,
                    name: AGENTS[role].name,
                    message: data.message,
                    actionable: data.actionable,
                }
            } catch (e) {
                return {
                    role,
                    name: AGENTS[role].name,
                    message: `${AGENTS[role].name} is evaluating the perimeter...`,
                    actionable: [],
                }
            }
        })
    )

    return results
}
