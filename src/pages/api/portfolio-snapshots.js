// Portfolio Snapshots API
// GET  — fetch snapshots for charting portfolio value over time
// POST — record a new snapshot

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
    // ── GET: Fetch snapshots ──
    if (req.method === 'GET') {
      const { days = 30 } = req.query
      const since = new Date()
      since.setDate(since.getDate() - Number(days))

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', since.toISOString())
        .order('recorded_at', { ascending: true })

      if (error) throw error
      return res.status(200).json(data)
    }

    // ── POST: Record a snapshot ──
    if (req.method === 'POST') {
      const { total_value, total_invested, pnl } = req.body

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .insert({
          user_id: userId,
          total_value: Number(total_value) || 0,
          total_invested: Number(total_invested) || 0,
          pnl: Number(pnl) || 0,
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Snapshots API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
