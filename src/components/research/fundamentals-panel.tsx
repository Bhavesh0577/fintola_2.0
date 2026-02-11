import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Target,
  DollarSign,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useState, useEffect } from "react"

interface FundamentalsData {
  symbol: string
  income_stmt: Record<string, unknown>[]
  balance_sheet: Record<string, unknown>[]
  cash_flow: Record<string, unknown>[]
  quarterly_income: Record<string, unknown>[]
  quarterly_balance: Record<string, unknown>[]
  quarterly_cashflow: Record<string, unknown>[]
  analyst_targets: {
    current: number | null
    low: number | null
    high: number | null
    mean: number | null
    median: number | null
  } | null
  recommendations: Record<string, unknown>[]
  ratios: Record<string, unknown>
}

function formatNum(v: unknown, decimals = 2): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (isNaN(n)) return "—"
  if (Math.abs(n) >= 1e12) return `₹${(n / 1e12).toFixed(decimals)}T`
  if (Math.abs(n) >= 1e9) return `₹${(n / 1e9).toFixed(decimals)}B`
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(decimals)}Cr`
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(decimals)}L`
  return n.toLocaleString("en-IN", { maximumFractionDigits: decimals })
}

function formatPct(v: unknown): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (isNaN(n)) return "—"
  return `${(n * 100).toFixed(2)}%`
}

function RatioCard({ label, value, fmt = "num" }: { label: string; value: unknown; fmt?: "num" | "pct" | "raw" }) {
  const display = fmt === "pct" ? formatPct(value) : fmt === "raw" ? (value?.toString() ?? "—") : formatNum(value)
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3.5">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-semibold text-zinc-900 dark:text-white tabular-nums">{display}</p>
    </div>
  )
}

const IMPORTANT_INCOME_ROWS = [
  "Total Revenue",
  "Cost Of Revenue",
  "Gross Profit",
  "Operating Income",
  "EBITDA",
  "Net Income",
  "Basic EPS",
  "Diluted EPS",
]

const IMPORTANT_BALANCE_ROWS = [
  "Total Assets",
  "Total Liabilities Net Minority Interest",
  "Total Equity Gross Minority Interest",
  "Total Debt",
  "Cash And Cash Equivalents",
  "Net Debt",
  "Working Capital",
  "Stockholders Equity",
]

const IMPORTANT_CASHFLOW_ROWS = [
  "Operating Cash Flow",
  "Capital Expenditure",
  "Free Cash Flow",
  "Investing Cash Flow",
  "Financing Cash Flow",
  "End Cash Position",
]

function FinancialTable({
  data,
  importantRows,
}: {
  data: Record<string, unknown>[]
  importantRows: string[]
}) {
  if (!data || data.length === 0) {
    return <p className="text-center text-zinc-600 py-8 text-sm">No data available</p>
  }

  const allKeys = new Set<string>()
  data.forEach((rec) => Object.keys(rec).forEach((k) => { if (k !== "date") allKeys.add(k) }))

  const rows = importantRows.filter((r) => allKeys.has(r))
  if (rows.length === 0) {
    const available = Array.from(allKeys).slice(0, 15)
    rows.push(...available)
  }

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-zinc-500 text-xs w-[200px] sticky left-0 bg-white dark:bg-[#09090b] z-10">Metric</TableHead>
            {data.map((rec, i) => (
              <TableHead key={i} className="text-zinc-500 text-xs text-right min-w-[120px]">
                {String(rec.date).slice(0, 10)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((key) => (
            <TableRow key={key} className="border-zinc-200 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
              <TableCell className="text-[13px] text-zinc-400 font-medium sticky left-0 bg-white dark:bg-[#09090b] z-10">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </TableCell>
              {data.map((rec, i) => (
                <TableCell key={i} className="text-right text-[13px] text-zinc-700 dark:text-zinc-300 tabular-nums">
                  {formatNum(rec[key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

export function FundamentalsPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<FundamentalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [symbol])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
      </div>
    )
  }

  if (!data || data.income_stmt?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-10 w-10 text-zinc-700 mb-3" />
        <p className="text-[15px] text-zinc-400">No fundamental data available for {symbol}</p>
        <p className="text-[12px] text-zinc-600 mt-1">This may not be supported for the selected ticker</p>
      </div>
    )
  }

  const ratios = data.ratios || {}
  const targets = data.analyst_targets

  return (
    <div className="space-y-6">
      {/* Company header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{String(ratios.shortName || symbol)}</h2>
          <p className="text-sm text-zinc-500">{String(ratios.sector || "")} · {String(ratios.industry || "")}</p>
        </div>
        {targets && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">Analyst Target</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">₹{targets.mean?.toLocaleString("en-IN") ?? "—"}</p>
            </div>
            <Target className="h-5 w-5 text-indigo-400" />
          </div>
        )}
      </div>

      {/* Key Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <RatioCard label="Market Cap" value={ratios.marketCap} />
        <RatioCard label="P/E (TTM)" value={ratios.trailingPE} />
        <RatioCard label="Forward P/E" value={ratios.forwardPE} />
        <RatioCard label="P/B Ratio" value={ratios.priceToBook} />
        <RatioCard label="Debt/Equity" value={ratios.debtToEquity} />
        <RatioCard label="ROE" value={ratios.returnOnEquity} fmt="pct" />
        <RatioCard label="Profit Margin" value={ratios.profitMargins} fmt="pct" />
        <RatioCard label="Operating Margin" value={ratios.operatingMargins} fmt="pct" />
        <RatioCard label="Revenue Growth" value={ratios.revenueGrowth} fmt="pct" />
        <RatioCard label="Dividend Yield" value={ratios.dividendYield} fmt="pct" />
      </div>

      {/* Analyst Targets Bar */}
      {targets && targets.low && targets.high && targets.current && (
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardContent className="py-4 px-5">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Analyst Price Target Range</p>
            <div className="relative h-3 rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden">
              <div
                className="absolute inset-y-0 bg-gradient-to-r from-red-500/40 via-amber-500/40 to-emerald-500/40 rounded-full"
                style={{ left: "0%", width: "100%" }}
              />
              {/* Current price marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 z-10"
                style={{
                  left: `${Math.min(100, Math.max(0, ((targets.current - targets.low) / (targets.high - targets.low)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-zinc-500">
              <span>Low: ₹{targets.low.toLocaleString("en-IN")}</span>
              <span className="text-indigo-400 font-medium">Current: ₹{targets.current.toLocaleString("en-IN")}</span>
              <span>High: ₹{targets.high.toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriod("annual")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === "annual" ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Annual
        </button>
        <button
          onClick={() => setPeriod("quarterly")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === "quarterly" ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Quarterly
        </button>
      </div>

      {/* Financial Statements Tabs */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]">
          <TabsTrigger value="income" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Income
          </TabsTrigger>
          <TabsTrigger value="balance" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4">
          <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
            <CardContent className="p-0">
              <FinancialTable
                data={period === "annual" ? data.income_stmt : data.quarterly_income}
                importantRows={IMPORTANT_INCOME_ROWS}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
            <CardContent className="p-0">
              <FinancialTable
                data={period === "annual" ? data.balance_sheet : data.quarterly_balance}
                importantRows={IMPORTANT_BALANCE_ROWS}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
            <CardContent className="p-0">
              <FinancialTable
                data={period === "annual" ? data.cash_flow : data.quarterly_cashflow}
                importantRows={IMPORTANT_CASHFLOW_ROWS}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" /> Analyst Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {data.recommendations.slice(0, 5).map((rec: Record<string, unknown>, i: number) => {
                const buy = Number(rec["Buy"] || rec["strongBuy"] || 0) + Number(rec["strongBuy"] || 0)
                const hold = Number(rec["Hold"] || rec["hold"] || 0)
                const sell = Number(rec["Sell"] || rec["sell"] || 0) + Number(rec["strongSell"] || 0)
                const period = String(rec["date"] || "").slice(0, 7)
                return (
                  <div key={i} className="flex-1 min-w-[100px] rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3 text-center">
                    <p className="text-[10px] text-zinc-600 mb-1.5">{period}</p>
                    <div className="flex justify-center gap-3 text-xs">
                      <span className="text-emerald-400">{buy} Buy</span>
                      <span className="text-amber-400">{hold} Hold</span>
                      <span className="text-red-400">{sell} Sell</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
