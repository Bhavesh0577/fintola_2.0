import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  TrendingDown,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Wallet,
  History,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

/* ─── Types ───────────────────────────────────────────────────── */
interface PaperTrade {
  id: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
  price: number
  total: number
  status: string
  created_at: string
}

/* ═══════════════════════════════════════════════════════════════════
   PAPER TRADING PANEL
   ═══════════════════════════════════════════════════════════════════ */
export function PaperTrading({
  userId,
  selectedSymbol,
}: {
  userId: string
  selectedSymbol: string
}) {
  const [trades, setTrades] = useState<PaperTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [executing, setExecuting] = useState(false)

  // Order form
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY")
  const [orderQty, setOrderQty] = useState("1")
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)

  // Virtual balance — calculated from trade history
  const STARTING_BALANCE = 10_00_000 // ₹10 Lakh virtual cash

  // ── Fetch trades ──
  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch(`/api/paper-trades?userId=${userId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setTrades(data)
    } catch (err) {
      console.error("Error fetching trades:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // ── Fetch live price for selected symbol ──
  const fetchPrice = useCallback(async () => {
    setPriceLoading(true)
    try {
      const res = await fetch(`/api/finance?symbol=${selectedSymbol}&type=quote`)
      if (!res.ok) throw new Error("fetch failed")
      const data = await res.json()
      const meta = data.meta || data
      setCurrentPrice(meta.regularMarketPrice ?? 0)
    } catch {
      setCurrentPrice(null)
    } finally {
      setPriceLoading(false)
    }
  }, [selectedSymbol])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  // Fetch price when drawer opens or symbol changes
  useEffect(() => {
    if (drawerOpen) fetchPrice()
  }, [drawerOpen, fetchPrice])

  // ── Open trade drawer ──
  const openTrade = (side: "BUY" | "SELL") => {
    setOrderSide(side)
    setOrderQty("1")
    setDrawerOpen(true)
  }

  // ── Execute paper trade ──
  const executeTrade = async () => {
    if (!currentPrice || !orderQty || Number(orderQty) <= 0) return
    setExecuting(true)

    try {
      const res = await fetch(`/api/paper-trades?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: orderSide,
          quantity: Number(orderQty),
          price: currentPrice,
        }),
      })

      if (!res.ok) throw new Error("Trade failed")

      const trade = await res.json()
      setTrades((prev) => [trade, ...prev])
      setDrawerOpen(false)

      toast.success(`${orderSide} order executed`, {
        description: `${Number(orderQty)} × ${selectedSymbol} @ ₹${currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
        duration: 4000,
      })
    } catch (err) {
      toast.error("Trade failed", {
        description: "Could not execute order. Please try again.",
      })
      console.error("Error executing trade:", err)
    } finally {
      setExecuting(false)
    }
  }

  // ── Compute virtual P&L from trade history ──
  const computeStats = () => {
    let totalBought = 0
    let totalSold = 0
    let totalBuyQty = 0
    let totalSellQty = 0
    let tradeCount = 0

    trades.forEach((t) => {
      if (t.status !== "EXECUTED") return
      tradeCount++
      const total = t.quantity * t.price
      if (t.side === "BUY") {
        totalBought += total
        totalBuyQty += t.quantity
      } else {
        totalSold += total
        totalSellQty += t.quantity
      }
    })

    const cashBalance = STARTING_BALANCE - totalBought + totalSold
    const realizedPnl = totalSold - totalBought // simplified
    const netPosition = totalBuyQty - totalSellQty

    return { cashBalance, realizedPnl, tradeCount, netPosition }
  }

  const stats = computeStats()
  const orderTotal = currentPrice && orderQty ? currentPrice * Number(orderQty) : 0

  return (
    <div className="space-y-5">
      {/* ── Trade Buttons ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openTrade("BUY")}
          className="group relative flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all"
        >
          <ShoppingCart className="h-4 w-4" />
          Buy {selectedSymbol.replace(".NS", "").replace("-USD", "")}
        </button>
        <button
          onClick={() => openTrade("SELL")}
          className="group relative flex items-center justify-center gap-2 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/20 hover:border-rose-500/30 transition-all"
        >
          <TrendingDown className="h-4 w-4" />
          Sell {selectedSymbol.replace(".NS", "").replace("-USD", "")}
        </button>
      </div>

      {/* ── Virtual Account Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium mb-1">Cash Balance</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{stats.cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium mb-1">Realized P&L</p>
            <p className={`text-sm font-bold ${stats.realizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {stats.realizedPnl >= 0 ? "+" : ""}₹{stats.realizedPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium mb-1">Total Trades</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">{stats.tradeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium mb-1">Starting Capital</p>
            <p className="text-sm font-bold text-zinc-400">₹10,00,000</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Trade History ── */}
      <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <CardHeader className="px-5 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            Trade History
            <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.06] text-zinc-500 text-[10px] ml-1">
              {trades.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <Separator className="bg-zinc-100 dark:bg-white/[0.04]" />

        {loading ? (
          <CardContent className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-zinc-100 dark:bg-white/[0.04]" />
            ))}
          </CardContent>
        ) : trades.length === 0 ? (
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No trades yet</p>
            <p className="text-xs text-zinc-600 mt-1">Start paper trading with ₹10,00,000 virtual cash</p>
          </CardContent>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-white/[0.04]">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Time</th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Symbol</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Side</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Qty</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Price</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-100 dark:border-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-xs text-zinc-500">
                        {new Date(t.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t.symbol}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 ${
                            t.side === "BUY"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {t.side}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-400">{t.quantity}</td>
                      <td className="px-3 py-3 text-right text-sm text-zinc-400">₹{t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        ₹{(t.quantity * t.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* ── Trade Drawer (vaul) ── */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/[0.08]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {orderSide === "BUY" ? (
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-rose-400" />
              )}
              {orderSide} {selectedSymbol}
            </DrawerTitle>
            <DrawerDescription className="text-zinc-500 text-sm">
              Paper trade · No real money involved
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4">
            {/* Price display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium mb-1">Market Price</p>
                {priceLoading ? (
                  <Skeleton className="h-7 w-32 rounded bg-zinc-200 dark:bg-white/[0.06]" />
                ) : (
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    ₹{currentPrice?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || "—"}
                  </p>
                )}
              </div>
              <button
                onClick={fetchPrice}
                disabled={priceLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-colors"
                title="Refresh price"
              >
                <Zap className={`h-4 w-4 text-zinc-500 ${priceLoading ? "animate-pulse" : ""}`} />
              </button>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5 block">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 25, 50].map((q) => (
                  <button
                    key={q}
                    onClick={() => setOrderQty(String(q))}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-all ${
                      orderQty === String(q)
                        ? "bg-zinc-100 dark:bg-white/[0.08] border-zinc-200 dark:border-white/[0.12] text-zinc-900 dark:text-white"
                        : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                min="1"
                className="w-full h-10 mt-2 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                placeholder="Custom quantity"
              />
            </div>

            {/* Order summary */}
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Symbol</span>
                <span className="text-zinc-900 dark:text-white font-semibold">{selectedSymbol}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Side</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    orderSide === "BUY"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {orderSide}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Quantity</span>
                <span className="text-zinc-900 dark:text-white">{orderQty || "0"}</span>
              </div>
              <Separator className="bg-zinc-200 dark:bg-white/[0.06]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-medium">Estimated Total</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">
                  ₹{orderTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <DrawerFooter className="flex-row gap-3 pt-2 pb-6">
            <DrawerClose asChild>
              <button className="flex-1 h-11 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
            </DrawerClose>
            <button
              onClick={executeTrade}
              disabled={!currentPrice || !orderQty || Number(orderQty) <= 0 || executing}
              className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 ${
                orderSide === "BUY"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              {executing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : orderSide === "BUY" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Confirm {orderSide}
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
