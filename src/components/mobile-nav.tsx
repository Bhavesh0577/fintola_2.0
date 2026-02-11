"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  Globe,
  Briefcase,
  ScanSearch,
  Sparkles,
  Wallet,
  Settings,
  TrendingUp,
  Menu,
  type LucideIcon,
} from "lucide-react"

interface MobileNavProps {
  activeNav: string
  onNavigate: (target: string) => void
}

function MobileNavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: string
  onClick: () => void
}) {
  return (
    <DrawerClose asChild>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          active
            ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`} />
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/20 px-1.5 text-[10px] font-bold text-indigo-400">
            {badge}
          </span>
        )}
      </button>
    </DrawerClose>
  )
}

export function MobileNav({ activeNav, onNavigate }: MobileNavProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          title="Navigation menu"
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Menu className="h-5 w-5 text-zinc-400" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#111113]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            Fintola
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-1">
          <MobileNavItem icon={LayoutDashboard} label="Dashboard" active={activeNav === "dashboard"} onClick={() => onNavigate("dashboard")} />
          <MobileNavItem icon={BarChart3} label="Trading" onClick={() => onNavigate("trade")} />
          <MobileNavItem icon={LineChart} label="Intraday" onClick={() => onNavigate("intraday")} />
          <MobileNavItem icon={Globe} label="Markets" badge="Live" onClick={() => onNavigate("markets")} />
          <MobileNavItem icon={Briefcase} label="Portfolio" onClick={() => onNavigate("portfolio")} />
          <MobileNavItem icon={ScanSearch} label="Research" badge="New" onClick={() => onNavigate("research")} />
          <MobileNavItem icon={Sparkles} label="AI Insights" onClick={() => onNavigate("ai")} />

          <Separator className="!my-3 bg-zinc-200 dark:bg-white/[0.06]" />

          <MobileNavItem icon={Wallet} label="Funding" onClick={() => onNavigate("funding")} />
          <MobileNavItem icon={Settings} label="Settings" onClick={() => onNavigate("settings")} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
