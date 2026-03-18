import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

/** GET /api/parties/:partyId/events - List events for a party */
router.get('/:partyId/events', async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.supabase
      .from('party_events')
      .select('*')
      .eq('party_id', req.params.partyId)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json({ events: data ?? [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to list events', details: String(err) })
  }
})

/** POST /api/parties/:partyId/events - Create an event */
router.post('/:partyId/events', async (req: Request, res: Response) => {
  try {
    const { id, name, date, location, link, notes, leadName } = req.body
    const now = new Date().toISOString()

    const { data, error } = await req.supabase
      .from('party_events')
      .insert({
        id: id || crypto.randomUUID(),
        party_id: req.params.partyId,
        name: name ?? '',
        date: date ?? '',
        location: location ?? '',
        link: link ?? '',
        notes: notes ?? '',
        lead_name: leadName ?? null,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ event: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', details: String(err) })
  }
})

/** PUT /api/parties/:partyId/events/:eventId - Update an event */
router.put('/:partyId/events/:eventId', async (req: Request, res: Response) => {
  try {
    const { name, date, location, link, notes, leadName } = req.body
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) update.name = name
    if (date !== undefined) update.date = date
    if (location !== undefined) update.location = location
    if (link !== undefined) update.link = link
    if (notes !== undefined) update.notes = notes
    if (leadName !== undefined) update.lead_name = leadName

    const { data, error } = await req.supabase
      .from('party_events')
      .update(update)
      .eq('id', req.params.eventId)
      .eq('party_id', req.params.partyId)
      .select()
      .single()

    if (error) throw error
    res.json({ event: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: String(err) })
  }
})

/** DELETE /api/parties/:partyId/events/:eventId - Delete an event */
router.delete('/:partyId/events/:eventId', async (req: Request, res: Response) => {
  try {
    const { error } = await req.supabase
      .from('party_events')
      .delete()
      .eq('id', req.params.eventId)
      .eq('party_id', req.params.partyId)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event', details: String(err) })
  }
})

export default router
