import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin, supabaseForUser } from '../supabase.js'
import type { SupabaseClient } from '@supabase/supabase-js'

const API_KEY_HEADER = 'x-api-key'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Authenticated user ID (from Supabase JWT or API key) */
      userId?: string
      /** Supabase client scoped to the authenticated user */
      supabase: SupabaseClient
      /** Auth method used: 'jwt' | 'apikey' */
      authMethod?: 'jwt' | 'apikey'
    }
  }
}

/**
 * Auth middleware that supports two methods:
 * 1. Supabase JWT in Authorization header (for user-facing apps)
 * 2. API key in x-api-key header (for service-to-service calls)
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check API key first (service-to-service)
  const apiKey = req.headers[API_KEY_HEADER] as string | undefined
  if (apiKey) {
    const validKey = process.env.API_SECRET_KEY
    if (!validKey) {
      res.status(500).json({ error: 'API key auth not configured' })
      return
    }
    if (apiKey !== validKey) {
      res.status(401).json({ error: 'Invalid API key' })
      return
    }
    // API key users get admin access
    req.supabase = supabaseAdmin
    req.authMethod = 'apikey'
    // Optionally pass user context via x-user-id header
    req.userId = req.headers['x-user-id'] as string | undefined
    next()
    return
  }

  // Check JWT (user-facing)
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization. Use Bearer <jwt> or x-api-key header.' })
    return
  }

  const jwt = authHeader.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(jwt)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.userId = user.id
  req.supabase = supabaseForUser(jwt)
  req.authMethod = 'jwt'
  next()
}

/** Optional auth - sets user if present but doesn't require it */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.supabase = supabaseAdmin

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7)
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (user) {
      req.userId = user.id
      req.supabase = supabaseForUser(jwt)
      req.authMethod = 'jwt'
    }
  }

  const apiKey = req.headers[API_KEY_HEADER] as string | undefined
  if (apiKey && apiKey === process.env.API_SECRET_KEY) {
    req.supabase = supabaseAdmin
    req.authMethod = 'apikey'
    req.userId = req.headers['x-user-id'] as string | undefined
  }

  next()
}
