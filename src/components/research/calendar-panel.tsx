import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Scissors,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"

interface CalendarData {
  symbol: string
  calendar: Record<string, unknown>
  earnings_dates: {
    date: string
    epsEstimate: number | null
    epsActual: number | null
    surprise: number | null
  }[]
  dividends: { date: string; amount: number | null }[]
  splits: { date: string; ratio: number | null }[]
}

function formatDate(d: string): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return d.slice(0, 10)
  }
}

function UpcomingEventCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof CalendarIcon
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.03] transition-all">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function CalendarPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/calendar?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [symbol])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/[0.04]" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-white/[0.04]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarIcon className="h-10 w-10 text-zinc-700 mb-3" />
        <p className="text-[15px] text-zinc-400">No calendar data available for {symbol}</p>
      </div>
    )
  }

  const cal = data.calendar || {}
  const earningsDates = Array.isArray(cal["Earnings Date"]) ? cal["Earnings Date"] : cal["Earnings Date"] ? [cal["Earnings Date"]] : []
  const exDivDate = cal["Ex-Dividend Date"] as string | undefined
  const divDate = cal["Dividend Date"] as string | undefined
  const revAvg = cal["Revenue Average"] as number | undefined
  const revLow = cal["Revenue Low"] as number | undefined
  const revHigh = cal["Revenue High"] as number | undefined
  const epsAvg = cal["Earnings Average"] as number | undefined

  return (
    <div className="space-y-6">
      {/* Upcoming Events Cards */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" /> Upcoming Events
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {earningsDates.length > 0 && (
            <UpcomingEventCard
              icon={CalendarIcon}
              label="Next Earnings"
              value={formatDate(String(earningsDates[0]))}
              sub={epsAvg != null ? `EPS Est: ₹${epsAvg}` : undefined}
              color="bg-indigo-500/20"
            />
          )}
          {exDivDate && (
            <UpcomingEventCard
              icon={DollarSign}
              label="Ex-Dividend Date"
              value={formatDate(String(exDivDate))}
              sub={divDate ? `Payment: ${formatDate(String(divDate))}` : undefined}
              color="bg-emerald-500/20"
            />
          )}
          {revAvg != null && (
            <UpcomingEventCard
              icon={TrendingUp}
              label="Revenue Estimate"
              value={`₹${Number(revAvg).toLocaleString("en-IN")}`}
              sub={revLow != null && revHigh != null ? `Range: ₹${Number(revLow).toLocaleString("en-IN")} – ₹${Number(revHigh).toLocaleString("en-IN")}` : undefined}
              color="bg-amber-500/20"
            />
          )}
        </div>
      </div>

      {/* Earnings History */}
      {data.earnings_dates && data.earnings_dates.length > 0 && (
        <Card className="border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-indigo-400" /> Earnings History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-xs">Date</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">EPS Estimate</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Reported EPS</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Surprise</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-center">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.earnings_dates.map((e, i) => {
                    const isFuture = e.epsActual === null
                    const beat = e.surprise != null && e.surprise > 0
                    const miss = e.surprise != null && e.surprise < 0

                    return (
                      <TableRow key={i} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-[13px] text-zinc-300 font-medium">
                          <div className="flex items-center gap-2">
                            {formatDate(e.date)}
                            {isFuture && (
                              <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-[9px] text-indigo-400">
                                Upcoming
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">
                          {e.epsEstimate != null ? `₹${e.epsEstimate}` : "—"}
                        </TableCell>
                        <TableCell className="text-[13px] text-right tabular-nums">
                          <span className={e.epsActual != null ? (beat ? "text-emerald-400" : miss ? "text-red-400" : "text-zinc-300") : "text-zinc-600"}>
                            {e.epsActual != null ? `₹${e.epsActual}` : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] text-right tabular-nums">
                          {e.surprise != null ? (
                            <span className={`flex items-center justify-end gap-1 ${beat ? "text-emerald-400" : miss ? "text-red-400" : "text-zinc-400"}`}>
                              {beat ? <TrendingUp className="h-3 w-3" /> : miss ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                              {Math.abs(e.surprise).toFixed(2)}%
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {!isFuture && (
                            beat ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> :
                            miss ? <AlertCircle className="h-4 w-4 text-red-400 mx-auto" /> :
                            <Minus className="h-4 w-4 text-zinc-600 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Dividends & Splits side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dividends */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Dividend History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dividends && data.dividends.length > 0 ? (
              <div className="space-y-2">
                {data.dividends.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-[12px] text-zinc-500">{formatDate(d.date)}</span>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-400">
                      ₹{d.amount?.toFixed(2) ?? "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-600 text-sm py-6">No dividend history</p>
            )}
          </CardContent>
        </Card>

        {/* Splits */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Scissors className="h-4 w-4 text-amber-400" /> Stock Splits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.splits && data.splits.length > 0 ? (
              <div className="space-y-2">
                {data.splits.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-[12px] text-zinc-500">{formatDate(s.date)}</span>
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-400">
                      {s.ratio ? `${s.ratio}:1` : "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-600 text-sm py-6">No stock splits</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
