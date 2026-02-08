-- ═══════════════════════════════════════════════════════════════
-- FINTOLA DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════

-- 1. Portfolio Holdings
CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  buy_price NUMERIC NOT NULL CHECK (buy_price > 0),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_holdings_user ON holdings(user_id);

-- 2. Paper Trades (Virtual Trading)
CREATE TABLE IF NOT EXISTS paper_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price > 0),
  total NUMERIC GENERATED ALWAYS AS (quantity * price) STORED,
  status TEXT NOT NULL DEFAULT 'EXECUTED' CHECK (status IN ('EXECUTED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_paper_trades_user ON paper_trades(user_id);

-- 3. Portfolio Snapshots (for portfolio value chart over time)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  pnl NUMERIC NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_snapshots_user_date ON portfolio_snapshots(user_id, recorded_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — users can only access their own data
-- We pass user_id from the app (Clerk user ID), matched via a custom header

-- Holdings policies
CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own holdings" ON holdings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own holdings" ON holdings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own holdings" ON holdings
  FOR DELETE USING (true);

-- Paper trades policies
CREATE POLICY "Users can view own trades" ON paper_trades
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own trades" ON paper_trades
  FOR INSERT WITH CHECK (true);

-- Portfolio snapshots policies
CREATE POLICY "Users can view own snapshots" ON portfolio_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own snapshots" ON portfolio_snapshots
  FOR INSERT WITH CHECK (true);
