import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  Gem,
} from "lucide-react"
import { useState, useEffect } from "react"

interface ScreenerItem {
  symbol: string
  shortName: string
  price: number | null
  change: number | null
  changePct: number | null
  volume: number | null
  marketCap: number | null
  exchange: string
}

interface ScreenerData {
  screen: string
  count: number
  items: ScreenerItem[]
}

const SCREENS = [
  { key: "most_actives", label: "Most Active", icon: Flame, color: "text-amber-400" },
  { key: "day_gainers", label: "Top Gainers", icon: TrendingUp, color: "text-emerald-400" },
  { key: "day_losers", label: "Top Losers", icon: TrendingDown, color: "text-red-400" },
  { key: "growth_technology_stocks", label: "Growth Tech", icon: Zap, color: "text-indigo-400" },
  { key: "undervalued_growth_stocks", label: "Undervalued", icon: Gem, color: "text-violet-400" },
  { key: "aggressive_small_caps", label: "Small Caps", icon: BarChart3, color: "text-cyan-400" },
] as const

function formatVol(v: unknown): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (isNaN(n)) return "—"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

function formatMcap(v: unknown): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (isNaN(n)) return "—"
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

export function ScreenerPanel({ onSelectSymbol }: { onSelectSymbol?: (sym: string) => void }) {
  const [activeScreen, setActiveScreen] = useState("most_actives")
  const [data, setData] = useState<ScreenerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/screener?screen=${encodeURIComponent(activeScreen)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeScreen])

  return (
    <div className="space-y-5">
      {/* Screen selector */}
      <div className="flex flex-wrap gap-2">
        {SCREENS.map((s) => {
          const active = activeScreen === s.key
          return (
            <button
              key={s.key}
              onClick={() => setActiveScreen(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                active
                  ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white ring-1 ring-zinc-200 dark:ring-white/[0.1]"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.04]"
              }`}
            >
              <s.icon className={`h-3.5 w-3.5 ${active ? s.color : ""}`} />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg bg-zinc-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-[15px] text-zinc-400">No results for this screener</p>
          <p className="text-[12px] text-zinc-600 mt-1">This may be due to market hours or availability</p>
        </div>
      ) : (
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="p-0">
            <div className="w-full max-h-[70vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-xs">#</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Symbol</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Name</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Price</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Change</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">% Change</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Volume</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Mkt Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, i) => {
                    const isUp = (item.changePct ?? 0) >= 0
                    return (
                      <TableRow
                        key={item.symbol}
                        className="border-zinc-200 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                        onClick={() => onSelectSymbol?.(item.symbol)}
                      >
                        <TableCell className="text-[12px] text-zinc-600 w-8">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{item.symbol}</span>
                            <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-[9px] text-zinc-600 px-1">
                              {item.exchange}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-zinc-400 max-w-[180px] truncate">{item.shortName}</TableCell>
                        <TableCell className="text-[13px] text-zinc-900 dark:text-white text-right tabular-nums font-medium">
                          ${item.price?.toFixed(2) ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-[13px] tabular-nums flex items-center justify-end gap-0.5 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {item.change != null ? Math.abs(item.change).toFixed(2) : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-[10px] tabular-nums ${isUp ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}
                          >
                            {isUp ? "+" : ""}{item.changePct?.toFixed(2) ?? "0"}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-zinc-500 text-right tabular-nums">{formatVol(item.volume)}</TableCell>
                        <TableCell className="text-[13px] text-zinc-500 text-right tabular-nums">{formatMcap(item.marketCap)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Count */}
      {data && data.count > 0 && (
        <p className="text-[11px] text-zinc-600 text-center">
          Showing {data.items.length} of {data.count} results · Data from Yahoo Finance
        </p>
      )}
    </div>
  )
}
