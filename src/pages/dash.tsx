import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Lazy-load heavy components to reduce initial bundle
const ChartUI = dynamic(() => import("@/components/chart-ui").then(m => ({ default: m.ChartUI })), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-xl bg-zinc-100 dark:bg-white/[0.04] animate-pulse" />,
})
const VaultTable = dynamic(() => import("@/components/vault-table").then(m => ({ default: m.VaultTable })), {
  loading: () => <div className="h-[300px] rounded-xl bg-zinc-100 dark:bg-white/[0.04] animate-pulse" />,
})
const CommandSearch = dynamic(() => import("@/components/command-search").then(m => ({ default: m.CommandSearch })), {
  ssr: false,
})
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  Globe,
  LayoutDashboard,
  LineChart,
  LogOut,
  Search,
  Settings,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  Clock,
  Eye,
  Star,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  Grid3X3,
  type LucideIcon,
} from "lucide-react"
import '../app/globals.css'
import { useState, useEffect, useCallback } from "react"
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

/* ─── Quick Stat Card ─────────────────────────────────────────── */
function QuickStatCard({
  label,
  value,
  change,
  isPositive,
  icon: Icon,
  accentColor,
}: {
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: LucideIcon
  accentColor: string
}) {
  return (
    <Card className="group relative overflow-hidden border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all duration-500 hover:border-zinc-300 dark:hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
              )}
              <span className={`text-xs font-semibold ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                {change}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-600 ml-1">vs yesterday</span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.04] ring-1 ring-zinc-200 dark:ring-white/[0.06]">
            <Icon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Trending Ticker ─────────────────────────────────────────── */
function TrendingTicker({
  symbol,
  price,
  change,
  isPositive,
  loading,
  onClick,
}: {
  symbol: string
  price?: string
  change?: string
  isPositive?: boolean
  loading?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] px-4 py-2.5 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] cursor-pointer shrink-0"
    >
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{symbol}</span>
      {loading ? (
        <>
          <Skeleton className="h-3.5 w-14 rounded bg-zinc-200 dark:bg-white/[0.06]" />
          <Skeleton className="h-3.5 w-10 rounded bg-zinc-200 dark:bg-white/[0.06]" />
        </>
      ) : (
        <>
          <span className="text-xs text-zinc-500">{price}</span>
          <span className={`text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>{change}</span>
        </>
      )}
    </button>
  )
}

/* ─── Trending Ticker Data ────────────────────────────────────── */
interface TickerData {
  symbol: string
  displayName: string
  yahooSymbol: string
  price: string
  change: string
  isPositive: boolean
  isCrypto: boolean
}

const TICKER_SYMBOLS = [
  { displayName: "NIFTY 50", yahooSymbol: "^NSEI", isCrypto: false },
  { displayName: "SENSEX", yahooSymbol: "^BSESN", isCrypto: false },
  { displayName: "RELIANCE", yahooSymbol: "RELIANCE.NS", isCrypto: false },
  { displayName: "TCS", yahooSymbol: "TCS.NS", isCrypto: false },
  { displayName: "HDFC", yahooSymbol: "HDFCBANK.NS", isCrypto: false },
  { displayName: "BTC", yahooSymbol: "BTC-USD", isCrypto: true },
  { displayName: "ETH", yahooSymbol: "ETH-USD", isCrypto: true },
]

/* ─── Sidebar Nav Item ────────────────────────────────────────── */
function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
  collapsed = false,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: string
  onClick?: () => void
  collapsed?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`group flex w-full items-center rounded-xl text-sm font-medium transition-all duration-200 ${
        collapsed ? "justify-center px-2 py-2.5 gap-0" : "gap-3 px-3 py-2.5"
      } ${
        active
          ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white shadow-sm shadow-black/5 dark:shadow-black/10"
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
      }`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"} transition-colors`} />
      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
      {!collapsed && badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/20 px-1.5 text-[10px] font-bold text-indigo-400">
          {badge}
        </span>
      )}
      {collapsed && badge && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500" />
      )}
    </button>
  )
}

/* ─── News helpers ─────────────────────────────────────────── */
interface NewsArticle {
  title: string
  publisher: string
  link: string
  timestamp: number
  thumbnail: string
}

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(unix * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const TAG_RULES: [RegExp, string][] = [
  [/Q[1-4]|quarter|earnings|revenue|profit|result/i, "Earnings"],
  [/RBI|SEBI|regulation|compliance|norms|policy|rate/i, "Regulation"],
  [/FII|DII|inflow|outflow|FPI/i, "Flows"],
  [/IPO|listing|debut/i, "IPO"],
  [/crypto|bitcoin|BTC|ethereum|ETH/i, "Crypto"],
  [/gold|silver|crude|oil|commodity/i, "Commodities"],
  [/IT|tech|software|Infosys|TCS|Wipro/i, "Tech"],
  [/bank|HDFC|ICICI|SBI|Kotak/i, "Banking"],
  [/buy|sell|target|upgrade|downgrade|rating/i, "Analysis"],
]

function autoTag(title: string, publisher: string): string {
  for (const [re, tag] of TAG_RULES) {
    if (re.test(title)) return tag
  }
  return publisher.length > 12 ? "Market" : publisher
}

/* ─── Market Pulse Item ───────────────────────────────────────── */
function MarketPulseItem({ article }: { article: NewsArticle }) {
  const tag = autoTag(article.title, article.publisher)
  const Wrapper = article.link ? "a" : "div"
  const wrapperProps = article.link
    ? { href: article.link, target: "_blank" as const, rel: "noopener noreferrer" }
    : {}

  return (
    <Wrapper {...wrapperProps} className="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.03] cursor-pointer">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.04] ring-1 ring-zinc-200 dark:ring-white/[0.06] mt-0.5">
        <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 leading-snug line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{article.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-600">{timeAgo(article.timestamp)}</span>
          <Badge variant="outline" className="h-4 border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-[9px] font-medium text-zinc-500 px-1.5">
            {tag}
          </Badge>
          <span className="text-[9px] text-zinc-400 dark:text-zinc-700 truncate max-w-[80px]">{article.publisher}</span>
        </div>
      </div>
    </Wrapper>
  )
}

function NewsSkeleton() {
  return (
    <div className="space-y-1 px-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-white/[0.04]" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3 bg-zinc-200 dark:bg-white/[0.04] rounded w-full" />
            <div className="h-3 bg-zinc-200 dark:bg-white/[0.04] rounded w-3/4" />
            <div className="h-2 bg-zinc-200 dark:bg-white/[0.04] rounded w-1/3 mt-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
export default function Page() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS")
  const [isClient, setIsClient] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [tickers, setTickers] = useState<TickerData[]>([])
  const [tickersLoading, setTickersLoading] = useState(true)

  // Dashboard stats from Supabase
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null)
  const [portfolioInvested, setPortfolioInvested] = useState(0)
  const [portfolioPnl, setPortfolioPnl] = useState(0)
  const [holdingsCount, setHoldingsCount] = useState(0)
  const [paperBalance, setPaperBalance] = useState(10_00_000)
  const [paperTradeCount, setPaperTradeCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // Market Pulse news
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    if (isLoaded && !user) router.push("/sign-in")
  }, [isLoaded, user, router])

  // Fetch news for selected symbol
  useEffect(() => {
    let cancelled = false
    setNewsLoading(true)
    fetch(`/api/news?symbol=${encodeURIComponent(selectedSymbol)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.articles) {
          setNewsItems(data.articles)
        }
      })
      .catch(() => {
        if (!cancelled) setNewsItems([])
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedSymbol])

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Live clock
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch live trending ticker prices
  useEffect(() => {
    const fetchTickers = async () => {
      setTickersLoading(true)
      const results: TickerData[] = []

      await Promise.allSettled(
        TICKER_SYMBOLS.map(async (t) => {
          try {
            const res = await fetch(`/api/finance?symbol=${t.yahooSymbol}&type=quote`)
            if (!res.ok) throw new Error("fetch failed")
            const data = await res.json()
            const meta = data.meta || data
            const price = meta.regularMarketPrice ?? 0
            const prevClose = meta.previousClose ?? price
            const diff = price - prevClose
            const pct = prevClose ? ((diff / prevClose) * 100).toFixed(2) : "0.00"
            const currencySymbol = t.isCrypto ? "$" : "₹"

            results.push({
              symbol: t.yahooSymbol,
              displayName: t.displayName,
              yahooSymbol: t.yahooSymbol,
              price: `${currencySymbol}${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
              change: `${diff >= 0 ? "+" : ""}${pct}%`,
              isPositive: diff >= 0,
              isCrypto: t.isCrypto,
            })
          } catch {
            results.push({
              symbol: t.yahooSymbol,
              displayName: t.displayName,
              yahooSymbol: t.yahooSymbol,
              price: "—",
              change: "—",
              isPositive: true,
              isCrypto: t.isCrypto,
            })
          }
        })
      )

      // Maintain original order
      const ordered = TICKER_SYMBOLS.map(
        (t) => results.find((r) => r.yahooSymbol === t.yahooSymbol)!
      )
      setTickers(ordered)
      setTickersLoading(false)
    }

    fetchTickers()
    // Refresh every 2 minutes
    const interval = setInterval(fetchTickers, 120_000)
    return () => clearInterval(interval)
  }, [])

  const handleCommandSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
  }, [])

  // Fetch dashboard stats from Supabase
  useEffect(() => {
    if (!user?.id) return
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        // Fetch holdings
        const holdingsRes = await fetch(`/api/holdings?userId=${user.id}`)
        if (holdingsRes.ok) {
          const holdings = await holdingsRes.json()
          setHoldingsCount(holdings.length)
          const invested = holdings.reduce((s: number, h: { buy_price: number; quantity: number }) => s + h.buy_price * h.quantity, 0)
          setPortfolioInvested(invested)

          // Fetch live prices for each holding to compute market value
          if (holdings.length > 0) {
            let totalValue = 0
            await Promise.allSettled(
              holdings.map(async (h: { symbol: string; quantity: number; buy_price: number }) => {
                try {
                  const res = await fetch(`/api/finance?symbol=${h.symbol}&type=quote`)
                  if (!res.ok) throw new Error("fail")
                  const data = await res.json()
                  const meta = data.meta || data
                  const price = meta.regularMarketPrice ?? h.buy_price
                  totalValue += price * h.quantity
                } catch {
                  totalValue += h.buy_price * h.quantity
                }
              })
            )
            setPortfolioValue(totalValue)
            setPortfolioPnl(totalValue - invested)
          } else {
            setPortfolioValue(0)
            setPortfolioPnl(0)
          }
        }

        // Fetch paper trades
        const tradesRes = await fetch(`/api/paper-trades?userId=${user.id}`)
        if (tradesRes.ok) {
          const trades = await tradesRes.json()
          setPaperTradeCount(trades.length)
          let totalBought = 0
          let totalSold = 0
          trades.forEach((t: { side: string; quantity: number; price: number; status: string }) => {
            if (t.status !== "EXECUTED") return
            const total = t.quantity * t.price
            if (t.side === "BUY") totalBought += total
            else totalSold += total
          })
          setPaperBalance(10_00_000 - totalBought + totalSold)
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [user?.id])

  /* ── Loading / Auth ── */
  if (!isClient || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
          </div>
          <p className="text-sm text-zinc-600 animate-pulse">Loading Fintola…</p>
        </div>
      </div>
    )
  }
  if (!user) return null

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good Morning"
    if (h < 17) return "Good Afternoon"
    return "Good Evening"
  })()

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">
      {/* ─── SIDEBAR ─── */}
      <aside className={`hidden lg:flex flex-col border-r border-zinc-200 dark:border-white/[0.04] bg-white dark:bg-[#09090b] transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-[72px]" : "w-[260px]"}`}>
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-zinc-200 dark:border-white/[0.04] ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">Fintola</span>}
        </div>

        {/* Nav */}
        <ScrollArea className={`flex-1 py-4 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          <div className="space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} collapsed={sidebarCollapsed} />
            <NavItem icon={BarChart3} label="Trading" onClick={() => router.push("/trade")} collapsed={sidebarCollapsed} />
            <NavItem icon={LineChart} label="Intraday" onClick={() => { window.location.href = "https://www.tradingview.com/chart/8daX0FdT/" }} collapsed={sidebarCollapsed} />
            <NavItem icon={Globe} label="Markets" badge="Live" onClick={() => setActiveNav("markets")} collapsed={sidebarCollapsed} />
            <NavItem icon={Briefcase} label="Portfolio" onClick={() => router.push("/portfolio")} collapsed={sidebarCollapsed} />
            <NavItem icon={ScanSearch} label="Research" badge="New" onClick={() => router.push("/research")} collapsed={sidebarCollapsed} />
            <NavItem icon={Grid3X3} label="Heatmap" badge="New" onClick={() => router.push("/heatmap")} collapsed={sidebarCollapsed} />
            <NavItem icon={Sparkles} label="AI Insights" onClick={() => setActiveNav("ai")} collapsed={sidebarCollapsed} />
          </div>
          <Separator className="my-4 bg-zinc-200 dark:bg-white/[0.04]" />
          <div className="space-y-1">
            <NavItem icon={Wallet} label="Funding" onClick={() => setActiveNav("funding")} collapsed={sidebarCollapsed} />
            <NavItem icon={Settings} label="Settings" onClick={() => setActiveNav("settings")} collapsed={sidebarCollapsed} />
          </div>
        </ScrollArea>

        {/* Collapse toggle */}
        <div className={`border-t border-zinc-200 dark:border-white/[0.04] ${sidebarCollapsed ? "px-2 py-2" : "px-3 py-2"}`}>
          <button
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2 text-zinc-500 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all"
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-zinc-200 dark:border-white/[0.04] ${sidebarCollapsed ? "p-2" : "p-3"}`}>
          <div className={`flex items-center rounded-xl ${sidebarCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2.5"}`}>
            <UserButton afterSignOutUrl="/" />
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                    {user.firstName || user.username || "User"}
                  </p>
                  <p className="text-[11px] text-zinc-600 truncate">
                    {user.primaryEmailAddress?.emailAddress || ""}
                  </p>
                </div>
                <SignOutButton>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors" title="Sign Out">
                    <LogOut className="h-3.5 w-3.5 text-zinc-600 hover:text-rose-400 transition-colors" />
                  </button>
                </SignOutButton>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between border-b border-zinc-200 dark:border-white/[0.04] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile nav drawer */}
            <MobileNav
              activeNav={activeNav}
              onNavigate={(target) => {
                if (target === "trade") router.push("/trade")
                else if (target === "intraday") window.location.href = "https://www.tradingview.com/chart/8daX0FdT/"
                else if (target === "portfolio") router.push("/portfolio")
                else if (target === "research") router.push("/research")
                else if (target === "heatmap") router.push("/heatmap")
                else if (target === "settings") router.push("/profile")
                else setActiveNav(target)
              }}
            />
            {/* Search Trigger — opens ⌘K */}
            <button
              title="Search (Ctrl+K)"
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 sm:gap-3 h-9 w-[160px] sm:w-[240px] md:w-[320px] px-3 text-sm bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-zinc-500 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.05] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all"
            >
              <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
              <span className="flex-1 text-left text-zinc-400 dark:text-zinc-600 text-xs sm:text-sm truncate">Search stocks, crypto…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Command Palette */}
          <CommandSearch open={cmdOpen} onOpenChange={setCmdOpen} onSelect={handleCommandSelect} />

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.06]">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-xs font-mono text-zinc-500">{currentTime} IST</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <ThemeToggle />
            <button title="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors">
              <Bell className="h-[18px] w-[18px] text-zinc-500" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
            </button>
            <button
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
              onClick={() => router.push("/profile")}
            >
              <Settings className="h-[18px] w-[18px] text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {greeting}, {user.firstName || user.username || "Trader"}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Here&apos;s what&apos;s happening in the markets today.</p>
            </div>
            <Badge variant="outline" className="w-fit border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1">
              <Eye className="h-3 w-3 mr-1" />
              Viewing: {selectedSymbol}
            </Badge>
          </div>

          {/* Trending Bar — Live Prices */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex h-7 items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.03] px-2.5 shrink-0 ring-1 ring-zinc-200 dark:ring-white/[0.06]">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Live</span>
            </div>
            {tickersLoading
              ? TICKER_SYMBOLS.map((t) => (
                  <TrendingTicker
                    key={t.yahooSymbol}
                    symbol={t.displayName}
                    loading
                    onClick={() => setSelectedSymbol(t.yahooSymbol)}
                  />
                ))
              : tickers.map((t) => (
                  <TrendingTicker
                    key={t.yahooSymbol}
                    symbol={t.displayName}
                    price={t.price}
                    change={t.change}
                    isPositive={t.isPositive}
                    onClick={() => setSelectedSymbol(t.yahooSymbol)}
                  />
                ))}
          </div>

          {/* Quick Stats — shown only on dashboard view */}
          {activeNav === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatCard
                label="Portfolio Value"
                value={statsLoading ? "Loading…" : portfolioValue !== null ? `₹${portfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹0"}
                change={statsLoading ? "Fetching…" : portfolioPnl !== 0 ? `${portfolioPnl >= 0 ? "+" : ""}₹${portfolioPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })} P&L` : `${holdingsCount} holdings`}
                isPositive={portfolioPnl >= 0}
                icon={Briefcase}
                accentColor="from-emerald-500/[0.03] to-transparent"
              />
              <QuickStatCard
                label="Paper Balance"
                value={statsLoading ? "Loading…" : `₹${paperBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                change={statsLoading ? "Fetching…" : `${paperTradeCount} trades executed`}
                isPositive={paperBalance >= 10_00_000}
                icon={Wallet}
                accentColor="from-indigo-500/[0.03] to-transparent"
              />
              <QuickStatCard
                label="Market Status"
                value={(() => { const h = new Date().getHours(); const m = new Date().getMinutes(); return (h > 9 || (h === 9 && m >= 15)) && h < 16 ? "Open" : "Closed" })()}
                change={(() => { const h = new Date().getHours(); const m = new Date().getMinutes(); return (h > 9 || (h === 9 && m >= 15)) && h < 16 ? "NSE Trading Hours" : "Opens 9:15 AM IST" })()}
                isPositive={(() => { const h = new Date().getHours(); const m = new Date().getMinutes(); return (h > 9 || (h === 9 && m >= 15)) && h < 16 })()}
                icon={Activity}
                accentColor="from-violet-500/[0.03] to-transparent"
              />
              <QuickStatCard
                label="AI Insights"
                value="Active"
                change="Gemini"
                isPositive
                icon={Star}
                accentColor="from-amber-500/[0.03] to-transparent"
              />
            </div>
          )}

          {/* Chart + Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
            {/* Chart */}
            <Card className="overflow-hidden border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-xl min-w-0">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                    <BarChart3 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white">{selectedSymbol}</CardTitle>
                    <p className="text-[11px] text-zinc-600 mt-0.5">Live chart · Candlestick</p>
                  </div>
                </div>
              </CardHeader>
              <Separator className="bg-zinc-200 dark:bg-white/[0.04]" />
              <CardContent className="p-4">
                <ChartUI symbol={selectedSymbol} />
              </CardContent>
            </Card>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Quick Actions */}
              <Card className="border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setSelectedSymbol("^NSEI")} className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] transition-all">
                      <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Nifty 50</span>
                    </button>
                    <button onClick={() => setSelectedSymbol("BTC-USD")} className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] transition-all">
                      <Globe className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Bitcoin</span>
                    </button>
                    <button onClick={() => setSelectedSymbol("RELIANCE.NS")} className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] transition-all">
                      <Briefcase className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Reliance</span>
                    </button>
                    <button onClick={() => router.push("/trade")} className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] transition-all">
                      <BarChart3 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Trade</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Market Pulse */}
              <Card className="border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-2 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      Market Pulse
                    </CardTitle>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <ScrollArea className="h-[320px]">
                    {newsLoading ? (
                      <NewsSkeleton />
                    ) : newsItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <Sparkles className="h-8 w-8 text-zinc-700 mb-3" />
                        <p className="text-[13px] text-zinc-500">No news available</p>
                        <p className="text-[11px] text-zinc-700 mt-1">Try selecting a different symbol</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5 px-1">
                        {newsItems.map((article, i) => (
                          <MarketPulseItem key={`${article.timestamp}-${i}`} article={article} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Market Data Table */}
          <Card className="border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white">Indian Market Overview</CardTitle>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-600 mt-0.5">Live prices · NSE &amp; BSE</p>
                  </div>
                </div>
                <Tabs defaultValue="all" className="w-auto">
                  <TabsList className="h-8 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] rounded-lg p-0.5">
                    <TabsTrigger value="all" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500">All</TabsTrigger>
                    <TabsTrigger value="stocks" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500">Stocks</TabsTrigger>
                    <TabsTrigger value="indices" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500">Indices</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <Separator className="bg-zinc-200 dark:bg-white/[0.04]" />
            <CardContent className="p-4">
              <VaultTable />
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}

