import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  Loader2,
  IndianRupee,
  Wallet,
  PieChart,
  RefreshCw,
} from "lucide-react"

/* ─── Types ───────────────────────────────────────────────────── */
interface Holding {
  id: string
  symbol: string
  quantity: number
  buy_price: number
  notes?: string
  created_at: string
  // computed live
  current_price?: number
  pnl?: number
  pnl_pct?: number
  market_value?: number
}

interface Snapshot {
  recorded_at: string
  total_value: number
  pnl: number
}

/* ═══════════════════════════════════════════════════════════════════
   PORTFOLIO TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function PortfolioTracker({
  userId,
  onSelectSymbol,
}: {
  userId: string
  onSelectSymbol: (symbol: string) => void
}) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formSymbol, setFormSymbol] = useState("")
  const [formQty, setFormQty] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formNotes, setFormNotes] = useState("")

  // ── Fetch holdings ──
  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch(`/api/holdings?userId=${userId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setHoldings(data)
    } catch (err) {
      console.error("Error fetching holdings:", err)
    }
  }, [userId])

  // ── Fetch snapshots for chart ──
  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/portfolio-snapshots?userId=${userId}&days=30`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setSnapshots(data)
    } catch (err) {
      console.error("Error fetching snapshots:", err)
    }
  }, [userId])

  // ── Fetch live prices for all holdings ──
  const fetchLivePrices = useCallback(async (holdingsList: Holding[]) => {
    if (holdingsList.length === 0) return
    setPricesLoading(true)

    const updated = await Promise.all(
      holdingsList.map(async (h) => {
        try {
          const res = await fetch(`/api/finance?symbol=${h.symbol}&type=quote`)
          if (!res.ok) throw new Error("fetch failed")
          const data = await res.json()
          const meta = data.meta || data
          const currentPrice = meta.regularMarketPrice ?? 0
          const marketValue = currentPrice * h.quantity
          const invested = h.buy_price * h.quantity
          const pnl = marketValue - invested
          const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0

          return {
            ...h,
            current_price: currentPrice,
            market_value: marketValue,
            pnl,
            pnl_pct: pnlPct,
          }
        } catch {
          return { ...h, current_price: undefined, pnl: undefined, pnl_pct: undefined, market_value: undefined }
        }
      })
    )

    setHoldings(updated)
    setPricesLoading(false)

    // Save a snapshot
    const totalValue = updated.reduce((s, h) => s + (h.market_value || 0), 0)
    const totalInvested = updated.reduce((s, h) => s + h.buy_price * h.quantity, 0)
    const totalPnl = totalValue - totalInvested

    if (totalValue > 0) {
      try {
        await fetch(`/api/portfolio-snapshots?userId=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total_value: totalValue, total_invested: totalInvested, pnl: totalPnl }),
        })
        fetchSnapshots()
      } catch { /* ignore */ }
    }
  }, [userId, fetchSnapshots])

  // ── Initial load ──
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchHoldings()
      await fetchSnapshots()
      setLoading(false)
    }
    init()
  }, [fetchHoldings, fetchSnapshots])

  // ── Fetch prices after holdings load ──
  useEffect(() => {
    if (!loading && holdings.length > 0 && holdings[0].current_price === undefined) {
      fetchLivePrices(holdings)
    }
  }, [loading, holdings, fetchLivePrices])

  // ── Add holding ──
  const handleAdd = async () => {
    if (!formSymbol || !formQty || !formPrice) return
    setSaving(true)
    try {
      const res = await fetch(`/api/holdings?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: formSymbol.toUpperCase(),
          quantity: Number(formQty),
          buy_price: Number(formPrice),
          notes: formNotes,
        }),
      })
      if (!res.ok) throw new Error("Failed to add")
      setFormSymbol("")
      setFormQty("")
      setFormPrice("")
      setFormNotes("")
      setAddOpen(false)
      const data = await fetchHoldings()
      // Refetch with prices
      const res2 = await fetch(`/api/holdings?userId=${userId}`)
      const updatedHoldings = await res2.json()
      fetchLivePrices(updatedHoldings)
    } catch (err) {
      console.error("Error adding holding:", err)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete holding ──
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/holdings?userId=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setHoldings((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      console.error("Error deleting holding:", err)
    }
  }

  // ── Computed totals ──
  const totalInvested = holdings.reduce((s, h) => s + h.buy_price * h.quantity, 0)
  const totalValue = holdings.reduce((s, h) => s + (h.market_value || h.buy_price * h.quantity), 0)
  const totalPnl = totalValue - totalInvested
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  // ── Chart data ──
  const chartData = snapshots.map((s) => ({
    date: new Date(s.recorded_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    value: Number(s.total_value),
    pnl: Number(s.pnl),
  }))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
        <Skeleton className="h-60 w-full rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-indigo-400" />
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total Invested</p>
            </div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-emerald-400" />
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Market Value</p>
            </div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">
              {pricesLoading ? (
                <Skeleton className="h-6 w-28 rounded bg-zinc-200 dark:bg-white/[0.06]" />
              ) : (
                `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {totalPnl >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-400" />
              )}
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total P&L</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-xl font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {pricesLoading ? (
                  <Skeleton className="h-6 w-28 rounded bg-zinc-200 dark:bg-white/[0.06]" />
                ) : (
                  `${totalPnl >= 0 ? "+" : ""}₹${totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                )}
              </p>
              {!pricesLoading && (
                <span className={`text-xs font-semibold ${totalPnl >= 0 ? "text-emerald-400/70" : "text-rose-400/70"}`}>
                  ({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Portfolio Value Chart ── */}
      {chartData.length > 1 && (
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-400" />
              Portfolio Value Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#e4e4e7",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#portfolioGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Holdings Table ── */}
      <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Your Holdings
              <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.06] text-zinc-500 text-[10px] ml-1">
                {holdings.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLivePrices(holdings)}
                disabled={pricesLoading}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-all disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${pricesLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 px-3 text-xs font-semibold text-indigo-400 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-zinc-100 dark:bg-white/[0.04]" />

        {holdings.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Briefcase className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No holdings yet</p>
            <p className="text-xs text-zinc-600 mt-1">Add your first stock to start tracking</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-400 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Holding
            </button>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/[0.04]">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Symbol</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Qty</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Buy Price</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">CMP</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Invested</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Value</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">P&L</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600"></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const invested = h.buy_price * h.quantity
                  const pnl = h.pnl ?? 0
                  const pnlPct = h.pnl_pct ?? 0
                  const isPos = pnl >= 0

                  return (
                    <tr
                      key={h.id}
                      className="border-b border-zinc-100 dark:border-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onSelectSymbol(h.symbol)}
                          className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-indigo-400 transition-colors"
                        >
                          {h.symbol}
                        </button>
                        {h.notes && <p className="text-[10px] text-zinc-600 mt-0.5">{h.notes}</p>}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-400">{h.quantity}</td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-400">₹{h.buy_price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-700 dark:text-zinc-300">
                        {h.current_price !== undefined ? (
                          `₹${h.current_price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                        ) : (
                          <Skeleton className="h-4 w-16 rounded bg-zinc-200 dark:bg-white/[0.06] ml-auto" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-400">₹{invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-700 dark:text-zinc-300">
                        {h.market_value !== undefined ? (
                          `₹${h.market_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        ) : (
                          <Skeleton className="h-4 w-16 rounded bg-zinc-200 dark:bg-white/[0.06] ml-auto" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {h.pnl !== undefined ? (
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                              {isPos ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </span>
                            <span className={`text-[10px] ${isPos ? "text-emerald-400/60" : "text-rose-400/60"}`}>
                              {isPos ? "+" : ""}{pnlPct.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <Skeleton className="h-4 w-16 rounded bg-zinc-200 dark:bg-white/[0.06] ml-auto" />
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-500/10 transition-all ml-auto"
                          title="Remove holding"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-zinc-600 hover:text-rose-400 transition-colors" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Add Holding Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white sm:rounded-2xl max-w-[420px] [&>button]:text-zinc-500">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" />
              Add Holding
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5 block">
                Symbol
              </label>
              <input
                type="text"
                value={formSymbol}
                onChange={(e) => setFormSymbol(e.target.value)}
                placeholder="e.g. RELIANCE.NS, BTC-USD"
                className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5 block">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  placeholder="10"
                  min="0"
                  step="any"
                  className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5 block">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="2450.00"
                  min="0"
                  step="any"
                  className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5 block">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Long-term hold, earnings play"
                className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <button className="h-9 px-4 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-all">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleAdd}
              disabled={!formSymbol || !formQty || !formPrice || saving}
              className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add Holding
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
