import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ─── Database Types ──────────────────────────────────────────── */

export interface Holding {
  id: string
  user_id: string
  symbol: string
  quantity: number
  buy_price: number
  created_at: string
  notes?: string
}

export interface PaperTrade {
  id: string
  user_id: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  created_at: string
  status: 'EXECUTED' | 'CANCELLED'
}

export interface PortfolioSnapshot {
  id: string
  user_id: string
  total_value: number
  total_invested: number
  pnl: number
  recorded_at: string
}
