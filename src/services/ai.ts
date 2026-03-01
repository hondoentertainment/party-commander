import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function generateThemeSuggestions(prompt: string) {
    if (!API_KEY) {
        console.warn('VITE_GEMINI_API_KEY is not defined. AI features will be disabled.')
        return null
    }

    try {
        const result = await model.generateContent([
            {
                text: `You are a world-class party planning assistant. Based on the user's input: "${prompt}", generate 3 creative and immersive party themes. For each theme, provide:
        1. A catchy name
        2. A brief 1-sentence vibe description
        3. A suggested signature drink
        4. A suggested main activity
        Return the result as a raw JSON array of objects with keys: name, vibe, drink, activity.`,
            },
        ])
        const response = await result.response
        const text = response.text()
        // Extract JSON if model wraps it in backticks
        const jsonMatch = text.match(/\[.*\]/s)
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (error) {
        console.error('Error generating AI suggestions:', error)
        return null
    }
}

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
