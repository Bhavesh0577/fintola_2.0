"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button title="Toggle theme" className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/[0.04] transition-colors">
        <Sun className="h-[18px] w-[18px] text-zinc-500" />
      </button>
    )
  }

  return (
    <button
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/[0.04] dark:hover:bg-white/[0.04] hover:bg-zinc-100 transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px] text-zinc-500 hover:text-zinc-300 transition-colors" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-zinc-500 hover:text-zinc-700 transition-colors" />
      )}
    </button>
  )
}
