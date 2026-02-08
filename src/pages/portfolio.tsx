import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioTracker } from "@/components/portfolio-tracker"
import { PaperTrading } from "@/components/paper-trading"
import { CommandSearch } from "@/components/command-search"
import { ChartUI } from "@/components/chart-ui"
import { Toaster } from "sonner"
import {
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
  type LucideIcon,
} from "lucide-react"
import "../app/globals.css"
import { useState, useEffect, useCallback } from "react"
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/router"

/* ─── Sidebar Nav Item ────────────────────────────────────────── */
function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/[0.08] text-white shadow-sm shadow-black/10"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
      }`}
    >
      <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"} transition-colors`} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/20 px-1.5 text-[10px] font-bold text-indigo-400">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PORTFOLIO & PAPER TRADING PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function PortfolioPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS")
  const [isClient, setIsClient] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [cmdOpen, setCmdOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"portfolio" | "paper">("portfolio")

  useEffect(() => {
    setIsClient(true)
    if (isLoaded && !user) router.push("/sign-in")
  }, [isLoaded, user, router])

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

  const handleCommandSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
  }, [])

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] text-white">
      {/* ─── SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.04] bg-[#09090b]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.04]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">Fintola</span>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/dash")} />
            <NavItem icon={BarChart3} label="Trading" onClick={() => router.push("/trade")} />
            <NavItem icon={LineChart} label="Intraday" onClick={() => { window.location.href = "https://www.tradingview.com/chart/8daX0FdT/" }} />
            <NavItem icon={Globe} label="Markets" badge="Live" onClick={() => router.push("/dash")} />
            <NavItem icon={Briefcase} label="Portfolio" active onClick={() => setActiveTab("portfolio")} />
            <NavItem icon={Zap} label="Paper Trading" active={activeTab === "paper"} onClick={() => setActiveTab("paper")} />
            <NavItem icon={ScanSearch} label="Research" badge="New" onClick={() => router.push("/research")} />
            <NavItem icon={Sparkles} label="AI Insights" onClick={() => router.push("/dash")} />
          </div>
          <Separator className="my-4 bg-white/[0.04]" />
          <div className="space-y-1">
            <NavItem icon={Wallet} label="Funding" onClick={() => router.push("/dash")} />
            <NavItem icon={Settings} label="Settings" onClick={() => router.push("/profile")} />
          </div>
        </ScrollArea>

        {/* User */}
        <div className="border-t border-white/[0.04] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-300 truncate">
                {user.firstName || user.username || "User"}
              </p>
              <p className="text-[11px] text-zinc-600 truncate">
                {user.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
            <SignOutButton>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors" title="Sign Out">
                <LogOut className="h-3.5 w-3.5 text-zinc-600 hover:text-rose-400 transition-colors" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-2xl px-6">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <div className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            {/* Search Trigger — opens ⌘K */}
            <button
              title="Search (Ctrl+K)"
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-3 h-9 w-[240px] md:w-[320px] px-3 text-sm bg-white/[0.03] border border-white/[0.06] text-zinc-500 rounded-xl hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
            >
              <Search className="h-4 w-4 text-zinc-600" />
              <span className="flex-1 text-left text-zinc-600 text-sm">Search stocks, crypto…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Command Palette */}
          <CommandSearch open={cmdOpen} onOpenChange={setCmdOpen} onSelect={handleCommandSelect} />

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg bg-white/[0.03] ring-1 ring-white/[0.06]">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-xs font-mono text-zinc-500">{currentTime} IST</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <button title="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/[0.04] transition-colors">
              <Bell className="h-[18px] w-[18px] text-zinc-500" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#09090b]" />
            </button>
            <button
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/[0.04] transition-colors"
              onClick={() => router.push("/profile")}
            >
              <Settings className="h-[18px] w-[18px] text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {activeTab === "portfolio" ? "Portfolio Tracker" : "Paper Trading"}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {activeTab === "portfolio"
                  ? "Track your real holdings & P&L against live market prices."
                  : "Practice trading with ₹10,00,000 virtual cash · No real money involved."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-fit border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1">
                <Eye className="h-3 w-3 mr-1" />
                {selectedSymbol}
              </Badge>
            </div>
          </div>

          {/* Tab Switcher */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "portfolio" | "paper")} className="w-auto">
            <TabsList className="h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 gap-1">
              <TabsTrigger
                value="portfolio"
                className="text-sm h-8 px-4 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500 gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="paper"
                className="text-sm h-8 px-4 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500 gap-2"
              >
                <Zap className="h-4 w-4" />
                Paper Trading
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* ── Portfolio Tab ── */}
          {activeTab === "portfolio" && (
            <PortfolioTracker userId={user.id} onSelectSymbol={setSelectedSymbol} />
          )}

          {/* ── Paper Trading Tab ── */}
          {activeTab === "paper" && (
            <div className="space-y-6">
              {/* Mini Chart for context */}
              <Card className="overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                      <BarChart3 className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-white">{selectedSymbol}</CardTitle>
                      <p className="text-[11px] text-zinc-600 mt-0.5">Live chart · Use Buy/Sell below to paper trade</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="bg-white/[0.04]" />
                <CardContent className="p-4">
                  <ChartUI symbol={selectedSymbol} />
                </CardContent>
              </Card>

              {/* Paper Trading Controls & History */}
              <PaperTrading userId={user.id} selectedSymbol={selectedSymbol} />
            </div>
          )}
        </div>
      </main>

      {/* Sonner Toaster for trade notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e4e4e7",
          },
        }}
      />
    </div>
  )
}
