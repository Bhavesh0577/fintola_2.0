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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react"
import { useState, useEffect } from "react"

interface HoldersData {
  symbol: string
  major_holders: { value: unknown; label: string }[]
  institutional_holders: {
    holder: string
    shares: number | null
    value: number | null
    pctHeld: number | null
    dateReported: string
  }[]
  mutual_fund_holders: {
    holder: string
    shares: number | null
    value: number | null
    pctHeld: number | null
    dateReported: string
  }[]
  insider_transactions: {
    insider: string
    relation: string
    transaction: string
    shares: number | null
    value: number | null
    date: string
  }[]
}

function formatCompact(v: unknown): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (isNaN(n)) return String(v)
  if (Math.abs(n) >= 1e12) return `₹${(n / 1e12).toFixed(1)}T`
  if (Math.abs(n) >= 1e9) return `₹${(n / 1e9).toFixed(1)}B`
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return n.toLocaleString("en-IN")
}

function OwnershipBar({ data }: { data: HoldersData["major_holders"] }) {
  if (!data || data.length === 0) return null
  const colors = ["bg-indigo-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"]

  return (
    <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-indigo-400" /> Ownership Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual bar */}
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {data.map((item, i) => {
            const val = parseFloat(String(item.value).replace("%", ""))
            if (isNaN(val) || val <= 0) return null
            return (
              <div
                key={i}
                className={`${colors[i % colors.length]} opacity-60 transition-all hover:opacity-100`}
                style={{ width: `${Math.min(val, 100)}%` }}
                title={`${item.label}: ${item.value}`}
              />
            )
          })}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
              <div className="min-w-0">
                <p className="text-[12px] text-zinc-400 truncate">{item.label}</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{String(item.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function HoldersPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<HoldersData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/holders?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [symbol])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
        <Skeleton className="h-64 rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="h-10 w-10 text-zinc-700 mb-3" />
        <p className="text-[15px] text-zinc-400">No holders data available for {symbol}</p>
      </div>
    )
  }

  const hasInst = data.institutional_holders && data.institutional_holders.length > 0
  const hasMf = data.mutual_fund_holders && data.mutual_fund_holders.length > 0
  const hasInsider = data.insider_transactions && data.insider_transactions.length > 0

  return (
    <div className="space-y-6">
      {/* Ownership Breakdown */}
      <OwnershipBar data={data.major_holders} />

      <Tabs defaultValue={hasInst ? "institutional" : hasMf ? "mutual" : "insider"} className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]">
          {hasInst && (
            <TabsTrigger value="institutional" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> Institutional
            </TabsTrigger>
          )}
          {hasMf && (
            <TabsTrigger value="mutual" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
              <Users className="h-3.5 w-3.5 mr-1.5" /> Mutual Funds
            </TabsTrigger>
          )}
          {hasInsider && (
            <TabsTrigger value="insider" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
              <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Insider Activity
            </TabsTrigger>
          )}
        </TabsList>

        {/* Institutional Holders */}
        {hasInst && (
          <TabsContent value="institutional" className="mt-4">
            <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-zinc-500 text-xs">Holder</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Shares</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Value</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">% Held</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.institutional_holders.map((h, i) => (
                        <TableRow key={i} className="border-zinc-200 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
                          <TableCell className="text-[13px] text-zinc-700 dark:text-zinc-300 font-medium max-w-[200px] truncate">{h.holder}</TableCell>
                          <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(h.shares)}</TableCell>
                          <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(h.value)}</TableCell>
                          <TableCell className="text-[13px] text-right">
                            <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-[10px] text-zinc-400">
                              {h.pctHeld != null ? `${(Number(h.pctHeld) * 100).toFixed(2)}%` : "—"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Mutual Fund Holders */}
        {hasMf && (
          <TabsContent value="mutual" className="mt-4">
            <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-zinc-500 text-xs">Fund</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Shares</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Value</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">% Held</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.mutual_fund_holders.map((h, i) => (
                        <TableRow key={i} className="border-zinc-200 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
                          <TableCell className="text-[13px] text-zinc-700 dark:text-zinc-300 font-medium max-w-[200px] truncate">{h.holder}</TableCell>
                          <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(h.shares)}</TableCell>
                          <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(h.value)}</TableCell>
                          <TableCell className="text-[13px] text-right">
                            <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-[10px] text-zinc-400">
                              {h.pctHeld != null ? `${(Number(h.pctHeld) * 100).toFixed(2)}%` : "—"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Insider Transactions */}
        {hasInsider && (
          <TabsContent value="insider" className="mt-4">
            <Card className="border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-zinc-500 text-xs">Insider</TableHead>
                        <TableHead className="text-zinc-500 text-xs">Transaction</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Shares</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Value</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.insider_transactions.map((t, i) => {
                        const isBuy = /buy|purchase|acquire/i.test(t.transaction)
                        const isSell = /sell|sale|dispose/i.test(t.transaction)
                        return (
                          <TableRow key={i} className="border-zinc-200 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
                            <TableCell className="max-w-[160px]">
                              <p className="text-[13px] text-zinc-700 dark:text-zinc-300 font-medium truncate">{t.insider}</p>
                              <p className="text-[10px] text-zinc-600 truncate">{t.relation}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${isBuy ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : isSell ? "border-red-500/20 text-red-400 bg-red-500/5" : "border-zinc-200 dark:border-white/[0.06] text-zinc-400"}`}
                              >
                                {isBuy && <ArrowUpRight className="h-3 w-3 mr-1" />}
                                {isSell && <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {t.transaction}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(t.shares)}</TableCell>
                            <TableCell className="text-[13px] text-zinc-400 text-right tabular-nums">{formatCompact(t.value)}</TableCell>
                            <TableCell className="text-[11px] text-zinc-600 text-right">{t.date ? t.date.slice(0, 10) : "—"}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {!hasInst && !hasMf && !hasInsider && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-[15px] text-zinc-400">No ownership data available</p>
          <p className="text-[12px] text-zinc-600 mt-1">Holder information may not be available for this ticker</p>
        </div>
      )}
    </div>
  )
}
