import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CommandSearch } from "@/components/command-search"
import { FundamentalsPanel } from "@/components/research/fundamentals-panel"
import { HoldersPanel } from "@/components/research/holders-panel"
import { CalendarPanel } from "@/components/research/calendar-panel"
import { ScreenerPanel } from "@/components/research/screener-panel"
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
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  FileText,
  Users,
  Calendar,
  ScanSearch,
  Grid3X3,
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
          ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white shadow-sm shadow-black/5 dark:shadow-black/10"
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
      }`}
    >
      <Icon className={`h-[18px] w-[18px] ${active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"} transition-colors`} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/20 px-1.5 text-[10px] font-bold text-indigo-400">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ─── Tab Button ──────────────────────────────────────────────── */
function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
  color,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white ring-1 ring-zinc-200 dark:ring-white/[0.08] shadow-sm shadow-black/5 dark:shadow-black/10"
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? color : "text-zinc-400 dark:text-zinc-600"} transition-colors`} />
      {label}
    </button>
  )
}

export default function ResearchPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [cmdOpen, setCmdOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS")
  const [activeTab, setActiveTab] = useState<"fundamentals" | "holders" | "calendar" | "screener">("fundamentals")

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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">
      {/* ─── SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-zinc-200 dark:border-white/[0.04] bg-white dark:bg-[#09090b]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-zinc-200 dark:border-white/[0.04]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">Fintola</span>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/dash")} />
            <NavItem icon={BarChart3} label="Trading" onClick={() => router.push("/trade")} />
            <NavItem icon={LineChart} label="Intraday" onClick={() => { window.location.href = "https://www.tradingview.com/chart/8daX0FdT/" }} />
            <NavItem icon={Globe} label="Markets" badge="Live" onClick={() => router.push("/dash")} />
            <NavItem icon={Briefcase} label="Portfolio" onClick={() => router.push("/portfolio")} />
            <NavItem icon={ScanSearch} label="Research" active badge="New" />
            <NavItem icon={Grid3X3} label="Heatmap" badge="New" onClick={() => router.push("/heatmap")} />
            <NavItem icon={Sparkles} label="AI Insights" onClick={() => router.push("/dash")} />
          </div>
          <Separator className="my-4 bg-zinc-200 dark:bg-white/[0.04]" />
          <div className="space-y-1">
            <NavItem icon={Wallet} label="Funding" onClick={() => router.push("/dash")} />
            <NavItem icon={Settings} label="Settings" onClick={() => router.push("/profile")} />
          </div>
        </ScrollArea>

        {/* User */}
        <div className="border-t border-zinc-200 dark:border-white/[0.04] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {user.firstName || user.username || "User"}
              </p>
              <p className="text-[11px] text-zinc-600 truncate">
                {user.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
            <SignOutButton>
              <button title="Sign out" className="rounded-lg p-1.5 text-zinc-500 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-white/[0.04] px-6">
          <div className="flex items-center gap-3">
            <ScanSearch className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Research</h1>
            <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-[10px] text-indigo-400">
              {selectedSymbol.replace(".NS", "").replace(".BO", "")}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Search trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search symbol…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-zinc-200 dark:border-white/[0.06] bg-zinc-100 dark:bg-white/[0.03] px-1.5 text-[10px] text-zinc-500 dark:text-zinc-600">
                ⌘K
              </kbd>
            </button>
            <span className="text-[11px] text-zinc-600 tabular-nums">{currentTime} IST</span>
            <button title="Notifications" className="relative rounded-xl p-2 text-zinc-500 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-200 dark:border-white/[0.04] overflow-x-auto">
          <TabButton icon={FileText} label="Fundamentals" active={activeTab === "fundamentals"} onClick={() => setActiveTab("fundamentals")} color="text-indigo-400" />
          <TabButton icon={Users} label="Holders" active={activeTab === "holders"} onClick={() => setActiveTab("holders")} color="text-violet-400" />
          <TabButton icon={Calendar} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} color="text-amber-400" />
          <TabButton icon={ScanSearch} label="Screener" active={activeTab === "screener"} onClick={() => setActiveTab("screener")} color="text-emerald-400" />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-6">
            {activeTab === "fundamentals" && <FundamentalsPanel symbol={selectedSymbol} />}
            {activeTab === "holders" && <HoldersPanel symbol={selectedSymbol} />}
            {activeTab === "calendar" && <CalendarPanel symbol={selectedSymbol} />}
            {activeTab === "screener" && (
              <ScreenerPanel
                onSelectSymbol={(sym) => {
                  setSelectedSymbol(sym)
                  setActiveTab("fundamentals")
                }}
              />
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Command Search */}
      <CommandSearch
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onSelect={handleCommandSelect}
      />
    </div>
  )
}
