import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware as requireAuth } from './middleware/auth.js'
import partiesRouter from './routes/parties.js'
import eventsRouter from './routes/events.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected routes
app.use('/api/parties', requireAuth, partiesRouter)
app.use('/api/parties', requireAuth, eventsRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Party Commander API running on port ${PORT}`)
})

export default app
