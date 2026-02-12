import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "sonner"

// Lazy-load heavy components (recharts treemap + command search)
const SectorHeatmap = dynamic(() => import("@/components/sector-heatmap").then(m => ({ default: m.SectorHeatmap })), {
  ssr: false,
  loading: () => <div className="h-[500px] rounded-xl bg-zinc-100 dark:bg-white/[0.04] animate-pulse" />,
})
const CommandSearch = dynamic(() => import("@/components/command-search").then(m => ({ default: m.CommandSearch })), { ssr: false })
import {
  BarChart3,
  Bell,
  Briefcase,
  Globe,
  Grid3X3,
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

/* ═══════════════════════════════════════════════════════════════════
   SECTOR HEATMAP PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function HeatmapPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [cmdOpen, setCmdOpen] = useState(false)

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

  /* ── Loading / Auth ── */
  if (!isClient || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
          </div>
          <p className="text-sm text-zinc-500 animate-pulse">Loading Fintola…</p>
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
            <NavItem icon={ScanSearch} label="Research" badge="New" onClick={() => router.push("/research")} />
            <NavItem icon={Grid3X3} label="Heatmap" active badge="New" />
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
              <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors" title="Sign Out">
                <LogOut className="h-3.5 w-3.5 text-zinc-600 hover:text-rose-400 transition-colors" />
              </button>
            </SignOutButton>
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
              activeNav="heatmap"
              onNavigate={(target) => {
                if (target === "dashboard") router.push("/dash")
                else if (target === "trade") router.push("/trade")
                else if (target === "intraday") window.location.href = "https://www.tradingview.com/chart/8daX0FdT/"
                else if (target === "portfolio") router.push("/portfolio")
                else if (target === "research") router.push("/research")
                else if (target === "heatmap") { /* already here */ }
                else if (target === "settings") router.push("/profile")
                else router.push("/dash")
              }}
            />
            {/* Search Trigger */}
            <button
              title="Search (Ctrl+K)"
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 sm:gap-3 h-9 w-[160px] sm:w-[240px] md:w-[320px] px-3 text-sm bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-zinc-500 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.05] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all"
            >
              <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
              <span className="flex-1 text-left text-zinc-400 dark:text-zinc-600 text-xs sm:text-sm truncate">Search stocks…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Command Palette */}
          <CommandSearch open={cmdOpen} onOpenChange={setCmdOpen} onSelect={() => {}} />

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.06]">
              <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-600" />
              <span className="text-xs font-mono text-zinc-500">{currentTime} IST</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1800px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 shadow-lg shadow-orange-500/20">
                  <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                Sector Heatmap
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 sm:mt-2 ml-9 sm:ml-12">
                <span className="hidden sm:inline">Live market sectors color-coded by daily % change · Sized by market cap · R-Factor highlights intraday outperformers</span>
                <span className="sm:hidden">Live sectors · Color = % change · Size = market cap</span>
              </p>
            </div>
            <div className="flex items-center gap-2 ml-9 sm:ml-0">
              <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-500 dark:text-orange-400 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                <Grid3X3 className="h-3 w-3 mr-1" />
                NSE India
              </Badge>
            </div>
          </div>

          {/* Heatmap Component */}
          <SectorHeatmap />
        </div>
      </main>

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
