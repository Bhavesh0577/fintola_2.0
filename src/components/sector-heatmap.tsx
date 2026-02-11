"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  Flame,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
  Info,
} from "lucide-react"

/* ─── Types ───────────────────────────────────────────────────── */
interface StockCell {
  name: string
  shortName: string
  size: number
  change: number
  lastPrice: number
  volume: number
  rFactor: number
  marketCap: number
}

interface SectorGroup {
  name: string
  change: number
  children: StockCell[]
}

interface HeatmapData {
  index: string
  indexChange: number
  sectors: SectorGroup[]
  totalStocks: number
  timestamp: string
  availableIndices: string[]
}

/* ─── Constants ───────────────────────────────────────────────── */
const SECTOR_INDICES = [
  { key: "NIFTY 50", label: "NIFTY 50", icon: BarChart3 },
  { key: "NIFTY BANK", label: "Bank", icon: Activity },
  { key: "NIFTY IT", label: "IT", icon: Zap },
  { key: "NIFTY PHARMA", label: "Pharma", icon: Activity },
  { key: "NIFTY AUTO", label: "Auto", icon: Activity },
  { key: "NIFTY FMCG", label: "FMCG", icon: Activity },
  { key: "NIFTY ENERGY", label: "Energy", icon: Flame },
  { key: "NIFTY METAL", label: "Metal", icon: Activity },
  { key: "NIFTY REALTY", label: "Realty", icon: Activity },
]

// Calls the Next.js proxy route which forwards to the Python API on Render

/* ─── Color Helpers ───────────────────────────────────────────── */
function getHeatColor(change: number): string {
  // Clamp change to [-5, 5] for color mapping
  const clamped = Math.max(-5, Math.min(5, change))
  const intensity = Math.abs(clamped) / 5

  if (change > 0) {
    // Green spectrum: from dim to vivid
    const r = Math.round(20 - intensity * 10)
    const g = Math.round(60 + intensity * 140)
    const b = Math.round(30 + intensity * 30)
    return `rgb(${r}, ${g}, ${b})`
  } else if (change < 0) {
    // Red spectrum: from dim to vivid
    const r = Math.round(60 + intensity * 160)
    const g = Math.round(20 - intensity * 10)
    const b = Math.round(25 + intensity * 10)
    return `rgb(${r}, ${g}, ${b})`
  }
  return "rgb(55, 55, 60)" // neutral gray for 0%
}

function getTextColor(change: number): string {
  const abs = Math.abs(change)
  if (abs > 1) return "#ffffff"
  if (abs > 0.3) return "rgba(255,255,255,0.9)"
  return "rgba(255,255,255,0.7)"
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `₹${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `₹${(cap / 1e9).toFixed(0)}B`
  if (cap >= 1e7) return `₹${(cap / 1e7).toFixed(0)}Cr`
  if (cap >= 1e5) return `₹${(cap / 1e5).toFixed(0)}L`
  return `₹${cap.toLocaleString()}`
}

function formatVolume(vol: number): string {
  if (vol >= 1e7) return `${(vol / 1e7).toFixed(1)}Cr`
  if (vol >= 1e5) return `${(vol / 1e5).toFixed(1)}L`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
  return vol.toString()
}

/* ─── Custom Treemap Cell ─────────────────────────────────────── */
function CustomizedContent(props: any) {
  const { x, y, width, height, name, change, rFactor, depth, root } = props

  // depth=1 is sector label, depth=2 is stock cell
  if (depth === 1) {
    // Sector group header — only draw if large enough
    if (width < 60 || height < 20) return null
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
        />
        <text
          x={x + 8}
          y={y + 14}
          fill="rgba(255,255,255,0.6)"
          fontSize={10}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing={0.5}
        >
          {name?.toUpperCase()}
        </text>
      </g>
    )
  }

  if (depth !== 2) return null

  const bgColor = getHeatColor(change || 0)
  const textFill = getTextColor(change || 0)
  const isOutperformer = (rFactor || 0) > 1.2
  const isUnderperformer = (rFactor || 0) < -0.5

  // Show more/less detail based on cell size
  const showSymbol = width > 35 && height > 22
  const showChange = width > 50 && height > 36
  const showPrice = width > 70 && height > 52
  const showRFactor = width > 80 && height > 66

  return (
    <g>
      {/* Cell background */}
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(width - 2, 0)}
        height={Math.max(height - 2, 0)}
        fill={bgColor}
        rx={3}
        ry={3}
        stroke={isOutperformer ? "rgba(250,204,21,0.7)" : "rgba(0,0,0,0.3)"}
        strokeWidth={isOutperformer ? 2 : 0.5}
      />
      {/* Stock symbol */}
      {showSymbol && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showChange ? -8 : 4)}
          textAnchor="middle"
          fill={textFill}
          fontSize={width > 80 ? 13 : width > 55 ? 11 : 9}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {name}
        </text>
      )}
      {/* % change */}
      {showChange && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showPrice ? 6 : 10)}
          textAnchor="middle"
          fill={textFill}
          fontSize={width > 70 ? 11 : 9}
          fontWeight={500}
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity={0.9}
        >
          {(change || 0) > 0 ? "+" : ""}
          {(change || 0).toFixed(2)}%
        </text>
      )}
      {/* Price */}
      {showPrice && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 20}
          textAnchor="middle"
          fill={textFill}
          fontSize={9}
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity={0.7}
        >
          ₹{props.lastPrice?.toLocaleString() || "—"}
        </text>
      )}
      {/* R-factor badge */}
      {showRFactor && isOutperformer && (
        <g>
          <rect
            x={x + width / 2 - 14}
            y={y + height / 2 + 26}
            width={28}
            height={14}
            rx={7}
            fill="rgba(250,204,21,0.25)"
            stroke="rgba(250,204,21,0.4)"
            strokeWidth={0.5}
          />
          <text
            x={x + width / 2}
            y={y + height / 2 + 36}
            textAnchor="middle"
            fill="rgb(250,204,21)"
            fontSize={8}
            fontWeight={700}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            R{(rFactor || 0).toFixed(1)}
          </text>
        </g>
      )}
    </g>
  )
}

/* ─── Custom Tooltip ──────────────────────────────────────────── */
function HeatmapTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data || !data.name || data.depth === 1) return null

  return (
    <div className="bg-zinc-50 dark:bg-[#1a1a2e] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/30 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-zinc-900 dark:text-white text-sm">{data.name}</span>
        <span
          className={`text-sm font-bold ${
            (data.change || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {(data.change || 0) > 0 ? "+" : ""}
          {(data.change || 0).toFixed(2)}%
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{data.shortName}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="text-zinc-500 dark:text-zinc-500">Price</div>
        <div className="text-right font-medium text-zinc-800 dark:text-zinc-200">₹{data.lastPrice?.toLocaleString()}</div>
        <div className="text-zinc-500 dark:text-zinc-500">Market Cap</div>
        <div className="text-right font-medium text-zinc-800 dark:text-zinc-200">{formatMarketCap(data.marketCap || 0)}</div>
        <div className="text-zinc-500 dark:text-zinc-500">Volume</div>
        <div className="text-right font-medium text-zinc-800 dark:text-zinc-200">{formatVolume(data.volume || 0)}</div>
        <div className="text-zinc-500 dark:text-zinc-500">R-Factor</div>
        <div className={`text-right font-bold ${(data.rFactor || 0) > 1 ? "text-amber-500" : "text-zinc-800 dark:text-zinc-200"}`}>
          {(data.rFactor || 0).toFixed(2)}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────── */
export function SectorHeatmap() {
  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50")
  const [data, setData] = useState<HeatmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHeatmap = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/nse-heatmap?index=${encodeURIComponent(selectedIndex)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setLastUpdate(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }))
    } catch (err: any) {
      setError(err.message || "Failed to fetch heatmap data")
    } finally {
      setLoading(false)
    }
  }, [selectedIndex])

  // Initial fetch + refetch on index change
  useEffect(() => {
    fetchHeatmap(true)
  }, [fetchHeatmap])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => fetchHeatmap(false), 60_000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchHeatmap])

  // Treemap data for recharts
  const treemapData = useMemo(() => {
    if (!data?.sectors) return []
    return data.sectors.map((sector) => ({
      name: sector.name,
      children: sector.children.map((stock) => ({
        name: stock.name,
        shortName: stock.shortName,
        size: stock.size,
        change: stock.change,
        lastPrice: stock.lastPrice,
        volume: stock.volume,
        rFactor: stock.rFactor,
        marketCap: stock.marketCap,
      })),
    }))
  }, [data])

  // Summary stats
  const stats = useMemo(() => {
    if (!data?.sectors) return { gainers: 0, losers: 0, unchanged: 0, topGainer: null as StockCell | null, topLoser: null as StockCell | null, outperformers: 0 }
    const allStocks = data.sectors.flatMap((s) => s.children)
    const gainers = allStocks.filter((s) => s.change > 0).length
    const losers = allStocks.filter((s) => s.change < 0).length
    const unchanged = allStocks.filter((s) => s.change === 0).length
    const topGainer = allStocks.reduce((a, b) => (a.change > b.change ? a : b), allStocks[0] || null)
    const topLoser = allStocks.reduce((a, b) => (a.change < b.change ? a : b), allStocks[0] || null)
    const outperformers = allStocks.filter((s) => s.rFactor > 1.2).length
    return { gainers, losers, unchanged, topGainer, topLoser, outperformers }
  }, [data])

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* ── Sector Selector ── */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 scrollbar-hide">
        <div className="flex items-center gap-1.5 sm:gap-2 sm:flex-wrap min-w-max sm:min-w-0">
          {SECTOR_INDICES.map((si) => (
            <button
              key={si.key}
              onClick={() => setSelectedIndex(si.key)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                selectedIndex === si.key
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-sm shadow-indigo-500/10"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06]"
              }`}
            >
              <si.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {si.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {data && !loading && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
          {/* Top row: index change + A/D ratio */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
            {/* Index change */}
            <Badge
              variant="outline"
              className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 shrink-0 ${
                data.indexChange >= 0
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {data.indexChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              <span className="hidden sm:inline">{selectedIndex} </span>{data.indexChange > 0 ? "+" : ""}{data.indexChange}%
            </Badge>

            {/* Advance/Decline */}
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUp className="h-3 w-3" />
                {stats.gainers}
              </span>
              <span className="text-zinc-400">/</span>
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-medium">
                <ArrowDown className="h-3 w-3" />
                {stats.losers}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 text-[10px]">A/D</span>
            </div>

            {/* Top gainer */}
            {stats.topGainer && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shrink-0">
                🔥 {stats.topGainer.name} +{stats.topGainer.change.toFixed(2)}%
              </Badge>
            )}

            {/* Top loser - hide on very small screens */}
            {stats.topLoser && (
              <Badge variant="outline" className="hidden xs:inline-flex text-[10px] px-2 py-0.5 border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 shrink-0">
                📉 {stats.topLoser.name} {stats.topLoser.change.toFixed(2)}%
              </Badge>
            )}

            {/* Outperformers - hide on mobile */}
            {stats.outperformers > 0 && (
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0.5 border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 shrink-0">
                ⚡ {stats.outperformers} outperformers (R&gt;1.2)
              </Badge>
            )}
          </div>

          <div className="flex-1" />

          {/* Auto refresh + last update */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                autoRefresh
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 bg-zinc-100 dark:bg-white/[0.04]"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
              {autoRefresh ? "LIVE" : "PAUSED"}
            </button>
            <button
              onClick={() => fetchHeatmap(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {lastUpdate && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdate}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Treemap ── */}
      <Card className="overflow-hidden border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center h-[350px] sm:h-[500px] md:h-[600px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-indigo-500" />
                <p className="text-xs sm:text-sm text-zinc-500 animate-pulse">
                  Fetching live data for {selectedIndex}…
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                  Downloading {selectedIndex === "NIFTY 50" ? "50+" : "10+"} stocks via NSE
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center h-[350px] sm:h-[500px] md:h-[600px]">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">Failed to load heatmap</p>
                <p className="text-[11px] sm:text-xs text-zinc-500 max-w-sm">{error}</p>
                <button
                  onClick={() => fetchHeatmap(true)}
                  className="mt-2 px-4 py-2 text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && treemapData.length > 0 && (
            <div className="w-full h-[350px] sm:h-[500px] md:h-[650px] lg:h-[700px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="rgba(0,0,0,0.4)"
                  fill="#222"
                  content={<CustomizedContent />}
                  isAnimationActive={false}
                >
                  <Tooltip content={<HeatmapTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Legend & R-Factor Info ── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-[10px] text-zinc-500 dark:text-zinc-500">
        {/* Color legend */}
        <div className="flex items-center gap-1.5">
          <span>Color scale:</span>
          <div className="flex h-3 rounded-sm overflow-hidden">
            {[
              getHeatColor(-4),
              getHeatColor(-2.5),
              getHeatColor(-1),
              getHeatColor(0),
              getHeatColor(1),
              getHeatColor(2.5),
              getHeatColor(4),
            ].map((c, i) => (
              <div key={i} className="w-4 sm:w-6 h-3" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>-5% → +5%</span>
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-4 bg-zinc-200 dark:bg-white/[0.06]" />

        {/* Size legend */}
        <span>Size = Market Cap</span>

        <Separator orientation="vertical" className="hidden sm:block h-4 bg-zinc-200 dark:bg-white/[0.06]" />

        {/* R-factor legend */}
        <div className="flex items-center gap-1.5">
          <Info className="h-3 w-3 shrink-0" />
          <span>
            <strong className="text-zinc-700 dark:text-zinc-300">R-Factor</strong> = Stock % ÷ Index % · R &gt; 1.2 = outperformer{" "}
            <span className="inline-block w-2 h-2 rounded-full border border-amber-400 bg-amber-400/20" />
          </span>
        </div>
      </div>

      {/* ── Sector Breakdown Table ── */}
      {data && !loading && (
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-5 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
              Sector Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-5 pb-3 sm:pb-4">
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <table className="w-full text-[11px] sm:text-xs min-w-[480px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/[0.06]">
                    <th className="text-left py-2 text-zinc-500 font-medium">Sector</th>
                    <th className="text-right py-2 text-zinc-500 font-medium">Avg Change</th>
                    <th className="text-right py-2 text-zinc-500 font-medium">Stocks</th>
                    <th className="text-right py-2 text-zinc-500 font-medium">Top Performer</th>
                    <th className="text-right py-2 text-zinc-500 font-medium">Worst Performer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sectors.map((sector) => {
                    const top = sector.children.reduce((a, b) => (a.change > b.change ? a : b), sector.children[0])
                    const worst = sector.children.reduce((a, b) => (a.change < b.change ? a : b), sector.children[0])
                    return (
                      <tr key={sector.name} className="border-b border-zinc-100 dark:border-white/[0.03] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{sector.name}</td>
                        <td className={`py-2.5 text-right font-bold ${sector.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {sector.change > 0 ? "+" : ""}{sector.change}%
                        </td>
                        <td className="py-2.5 text-right text-zinc-500">{sector.children.length}</td>
                        <td className="py-2.5 text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {top?.name} +{top?.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            {worst?.name} {worst?.change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
