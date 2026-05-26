import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
export const hasGeminiKey = !!API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function generateBudgetOptimization(items: any[], limit?: number) {
    if (!API_KEY) {
        console.warn('VITE_GEMINI_API_KEY is not defined. AI features will be disabled.')
        return ['AI Optimization is currently unavailable. Please check your VITE_GEMINI_API_KEY in the environment.']
    }

    try {
        const result = await model.generateContent([
            {
                text: `As a world-class party planner, optimize this budget: ${JSON.stringify(items)}. The total limit is ${limit ? `$${limit}` : 'not set'}. Provide 3 targeted tips to save money or increase value without compromising the premium feel. Return as a JSON array of strings.`,
            },
        ])
        const response = await result.response
        const text = response.text()
        const jsonMatch = text.match(/\[.*\]/s)
        return jsonMatch ? JSON.parse(jsonMatch[0]) : ['Unable to parse AI response. Please try again.']
    } catch (error) {
        console.error('Error optimizing budget:', error)
        return ['An error occurred while analyzing the budget.']
    }
}
