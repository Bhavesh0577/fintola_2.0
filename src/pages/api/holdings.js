// Portfolio Holdings API
// GET  — fetch all holdings for a user
// POST — add a new holding
// DELETE — remove a holding by id

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    // ── GET: Fetch holdings ──
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json(data)
    }

    // ── POST: Add holding ──
    if (req.method === 'POST') {
      const { symbol, quantity, buy_price, notes } = req.body

      if (!symbol || !quantity || !buy_price) {
        return res.status(400).json({ error: 'symbol, quantity, and buy_price are required' })
      }

      const { data, error } = await supabase
        .from('holdings')
        .insert({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          quantity: Number(quantity),
          buy_price: Number(buy_price),
          notes: notes || '',
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    }

    // ── DELETE: Remove holding ──
    if (req.method === 'DELETE') {
      const { id } = req.body || req.query

      if (!id) {
        return res.status(400).json({ error: 'holding id is required' })
      }

      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return res.status(200).json({ success: true })
    }

    // ── PUT: Update holding ──
    if (req.method === 'PUT') {
      const { id, quantity, buy_price, notes } = req.body

      if (!id) {
        return res.status(400).json({ error: 'holding id is required' })
      }

      const updates = {}
      if (quantity !== undefined) updates.quantity = Number(quantity)
      if (buy_price !== undefined) updates.buy_price = Number(buy_price)
      if (notes !== undefined) updates.notes = notes

      const { data, error } = await supabase
        .from('holdings')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Holdings API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
