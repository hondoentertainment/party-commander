import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

/** GET /api/parties - List all parties for the authenticated user */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get user's party profile
    const { data: profile } = await req.supabase
      .from('party_profiles')
      .select('id')
      .eq('owner_id', req.userId!)
      .single()

    if (!profile) {
      res.json({ parties: [] })
      return
    }

    // Get owned parties
    const { data: owned, error: ownedErr } = await req.supabase
      .from('parties')
      .select('id, party_profile_id, name, state, created_at, updated_at')
      .eq('party_profile_id', profile.id)
      .order('updated_at', { ascending: false })

    if (ownedErr) throw ownedErr

    // Get collaborated parties
    const { data: collabs } = await req.supabase
      .from('party_collaborators')
      .select('party_id')
      .eq('user_id', req.userId!)

    let collaborated: typeof owned = []
    if (collabs?.length) {
      const ids = collabs.map((c) => c.party_id)
      const { data } = await req.supabase
        .from('parties')
        .select('id, party_profile_id, name, state, created_at, updated_at')
        .in('id', ids)
        .order('updated_at', { ascending: false })
      collaborated = data ?? []
    }

    // Merge and dedupe
    const seen = new Set((owned ?? []).map((p) => p.id))
    const merged = [...(owned ?? [])]
    for (const p of collaborated) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        merged.push(p)
      }
    }
    merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    res.json({ parties: merged })
  } catch (err) {
    res.status(500).json({ error: 'Failed to list parties', details: String(err) })
  }
})

/** GET /api/parties/:id - Get a single party */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.supabase
      .from('parties')
      .select('id, party_profile_id, name, state, created_at, updated_at')
      .eq('id', req.params.id)
      .single()

    if (error || !data) {
      res.status(404).json({ error: 'Party not found' })
      return
    }

    res.json({ party: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get party', details: String(err) })
  }
})

/** POST /api/parties - Create a new party */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(400).json({ error: 'User ID required to create party' })
      return
    }

    // Ensure party profile exists
    let { data: profile } = await req.supabase
      .from('party_profiles')
      .select('id')
      .eq('owner_id', req.userId)
      .single()

    if (!profile) {
      const { data: newProfile, error: profileErr } = await req.supabase
        .from('party_profiles')
        .insert({ owner_id: req.userId, name: 'My Profile' })
        .select('id')
        .single()
      if (profileErr) throw profileErr
      profile = newProfile
    }

    const state = req.body.state ?? req.body
    const name = state?.core?.name || req.body.name || 'New Party'

    const { data, error } = await req.supabase
      .from('parties')
      .insert({
        party_profile_id: profile!.id,
        name,
        state: stripAuth(state),
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ party: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create party', details: String(err) })
  }
})

/** PUT /api/parties/:id - Update full party state */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const state = req.body.state ?? req.body
    const name = state?.core?.name || req.body.name

    const update: Record<string, unknown> = {
      state: stripAuth(state),
      updated_at: new Date().toISOString(),
    }
    if (name) update.name = name

    const { data, error } = await req.supabase
      .from('parties')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ party: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update party', details: String(err) })
  }
})

/** PATCH /api/parties/:id - Partial update of party state */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    // First get current state
    const { data: existing, error: getErr } = await req.supabase
      .from('parties')
      .select('state, name')
      .eq('id', req.params.id)
      .single()

    if (getErr || !existing) {
      res.status(404).json({ error: 'Party not found' })
      return
    }

    const currentState = existing.state as Record<string, unknown>
    const patches = req.body

    // Deep merge top-level sections (e.g. { budget: { limit: 500 } })
    const merged = { ...currentState }
    for (const [key, value] of Object.entries(patches)) {
      if (key === 'auth') continue
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && typeof currentState[key] === 'object') {
        merged[key] = { ...(currentState[key] as Record<string, unknown>), ...(value as Record<string, unknown>) }
      } else {
        merged[key] = value
      }
    }

    const name = (merged.core as Record<string, unknown>)?.name as string || existing.name

    const { data, error } = await req.supabase
      .from('parties')
      .update({
        state: merged,
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ party: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to patch party', details: String(err) })
  }
})

/** DELETE /api/parties/:id - Delete a party */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await req.supabase
      .from('parties')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete party', details: String(err) })
  }
})

// -- Module-specific convenience endpoints --

const MODULE_KEYS = [
  'core', 'budget', 'invites', 'events', 'leads', 'menu', 'drinks',
  'decor', 'cleaning', 'timeline', 'music', 'games', 'venue', 'entry',
  'live', 'postParty', 'photoVideo', 'admin',
] as const

/** GET /api/parties/:id/:module - Get a specific module's state */
router.get('/:id/:module', async (req: Request, res: Response) => {
  const mod = req.params.module as string
  if (!MODULE_KEYS.includes(mod as typeof MODULE_KEYS[number])) {
    res.status(400).json({ error: `Invalid module: ${mod}`, validModules: MODULE_KEYS })
    return
  }

  try {
    const { data, error } = await req.supabase
      .from('parties')
      .select('state')
      .eq('id', req.params.id)
      .single()

    if (error || !data) {
      res.status(404).json({ error: 'Party not found' })
      return
    }

    const state = data.state as Record<string, unknown>
    res.json({ [mod]: state[mod] ?? null })
  } catch (err) {
    res.status(500).json({ error: `Failed to get ${mod}`, details: String(err) })
  }
})

/** PATCH /api/parties/:id/:module - Update a specific module's state */
router.patch('/:id/:module', async (req: Request, res: Response) => {
  const mod = req.params.module as string
  if (!MODULE_KEYS.includes(mod as typeof MODULE_KEYS[number])) {
    res.status(400).json({ error: `Invalid module: ${mod}`, validModules: MODULE_KEYS })
    return
  }

  try {
    const { data: existing, error: getErr } = await req.supabase
      .from('parties')
      .select('state, name')
      .eq('id', req.params.id)
      .single()

    if (getErr || !existing) {
      res.status(404).json({ error: 'Party not found' })
      return
    }

    const currentState = existing.state as Record<string, unknown>
    const currentModule = (currentState[mod] ?? {}) as Record<string, unknown>
    const updates = req.body

    const merged = {
      ...currentState,
      [mod]: typeof updates === 'object' && !Array.isArray(updates)
        ? { ...currentModule, ...updates }
        : updates,
    }

    const name = mod === 'core' && updates.name
      ? updates.name
      : existing.name

    const { data, error } = await req.supabase
      .from('parties')
      .update({
        state: merged,
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ [mod]: (data.state as Record<string, unknown>)[mod] })
  } catch (err) {
    res.status(500).json({ error: `Failed to update ${mod}`, details: String(err) })
  }
})

function stripAuth(state: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!state) return {}
  const { auth: _auth, ...rest } = state
  return rest
}

export default router
