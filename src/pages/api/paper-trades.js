// Paper Trades API
// GET  — fetch all paper trades for a user
// POST — execute a new paper trade

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
    // ── GET: Fetch trade history ──
    if (req.method === 'GET') {
      const { limit = 50 } = req.query

      const { data, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(Number(limit))

      if (error) throw error
      return res.status(200).json(data)
    }

    // ── POST: Execute a paper trade ──
    if (req.method === 'POST') {
      const { symbol, side, quantity, price } = req.body

      if (!symbol || !side || !quantity || !price) {
        return res.status(400).json({ error: 'symbol, side, quantity, and price are required' })
      }

      if (!['BUY', 'SELL'].includes(side.toUpperCase())) {
        return res.status(400).json({ error: 'side must be BUY or SELL' })
      }

      const { data, error } = await supabase
        .from('paper_trades')
        .insert({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          side: side.toUpperCase(),
          quantity: Number(quantity),
          price: Number(price),
          status: 'EXECUTED',
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Paper Trades API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
