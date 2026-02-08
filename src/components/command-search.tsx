import { useCallback, useEffect, useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  BarChart3,
  Bitcoin,
  Building2,
  Clock,
  Globe,
  Landmark,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"

/* ─── Stock / Symbol Catalog ──────────────────────────────────── */
const INDIAN_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "IT" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Banking" },
  { symbol: "INFY.NS", name: "Infosys", sector: "IT" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Banking" },
  { symbol: "SBIN.NS", name: "State Bank of India", sector: "Banking" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel", sector: "Metals" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", sector: "Telecom" },
  { symbol: "ITC.NS", name: "ITC Limited", sector: "FMCG" },
  { symbol: "WIPRO.NS", name: "Wipro", sector: "IT" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", sector: "IT" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", sector: "Banking" },
  { symbol: "LT.NS", name: "Larsen & Toubro", sector: "Infrastructure" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", sector: "Banking" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", sector: "Auto" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Auto" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", sector: "Conglomerate" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", sector: "Finance" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", sector: "Pharma" },
  { symbol: "ONGC.NS", name: "Oil & Natural Gas Corp", sector: "Energy" },
]

const INDICES = [
  { symbol: "^NSEI", name: "Nifty 50", sector: "Index" },
  { symbol: "^BSESN", name: "BSE Sensex", sector: "Index" },
]

const CRYPTO = [
  { symbol: "BTC-USD", name: "Bitcoin", sector: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum", sector: "Crypto" },
  { symbol: "SOL-USD", name: "Solana", sector: "Crypto" },
  { symbol: "XRP-USD", name: "Ripple", sector: "Crypto" },
  { symbol: "ADA-USD", name: "Cardano", sector: "Crypto" },
  { symbol: "DOGE-USD", name: "Dogecoin", sector: "Crypto" },
  { symbol: "DOT-USD", name: "Polkadot", sector: "Crypto" },
  { symbol: "LINK-USD", name: "Chainlink", sector: "Crypto" },
  { symbol: "BNB-USD", name: "Binance Coin", sector: "Crypto" },
  { symbol: "LTC-USD", name: "Litecoin", sector: "Crypto" },
]

const RECENT_KEY = "fintola_recent_searches"
const MAX_RECENT = 5

function getRecents(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch {
    return []
  }
}

function saveRecent(symbol: string) {
  const recents = getRecents().filter((s) => s !== symbol)
  recents.unshift(symbol)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)))
}

/* ─── Sector Icon Map ─────────────────────────────────────────── */
function SectorIcon({ sector }: { sector: string }) {
  switch (sector) {
    case "Index":
      return <TrendingUp className="h-4 w-4 text-emerald-400" />
    case "Crypto":
      return <Bitcoin className="h-4 w-4 text-orange-400" />
    case "Banking":
    case "Finance":
      return <Landmark className="h-4 w-4 text-blue-400" />
    case "IT":
      return <Globe className="h-4 w-4 text-violet-400" />
    default:
      return <Building2 className="h-4 w-4 text-zinc-400" />
  }
}

/* ═══════════════════════════════════════════════════════════════════
   COMMAND SEARCH COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (symbol: string) => void
}

export function CommandSearch({ open, onOpenChange, onSelect }: CommandSearchProps) {
  const [recents, setRecents] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      setRecents(getRecents())
      setSearch("")
    }
  }, [open])

  const handleSelect = useCallback(
    (symbol: string) => {
      saveRecent(symbol)
      onSelect(symbol)
      onOpenChange(false)
    },
    [onSelect, onOpenChange]
  )

  // Find item data by symbol
  const allItems = [...INDICES, ...INDIAN_STOCKS, ...CRYPTO]
  const findItem = (sym: string) => allItems.find((i) => i.symbol === sym)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl shadow-black/50 border-white/[0.08] bg-[#111113] sm:rounded-2xl max-w-[540px] [&>button]:hidden">
        <Command className="bg-transparent">
          {/* Search Input */}
          <div className="flex items-center border-b border-white/[0.06] px-4">
            <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-500" />
            <CommandInput
              placeholder="Search stocks, crypto, indices…"
              className="h-12 text-sm text-zinc-200 placeholder:text-zinc-600 border-0 focus:ring-0"
              value={search}
              onValueChange={setSearch}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-zinc-500">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[400px] p-2">
            <CommandEmpty className="p-2">
              <button
                onClick={() => {
                  const trimmed = search.trim().toUpperCase()
                  if (trimmed) handleSelect(trimmed)
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.06] cursor-pointer transition-colors"
              >
                <Search className="h-4 w-4 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-zinc-300">
                    Search for &quot;{search.trim().toUpperCase()}&quot;
                  </span>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Try any Yahoo Finance symbol (e.g. AAPL, MSFT, TSLA)</p>
                </div>
                <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] text-zinc-500">↵</kbd>
              </button>
            </CommandEmpty>

            {/* Custom Symbol Search — always visible when typing */}
            {search.trim().length > 0 && (
              <CommandGroup heading="Custom Search">
                <CommandItem
                  value={`__custom__ ${search.trim()}`}
                  onSelect={() => {
                    const trimmed = search.trim().toUpperCase()
                    if (trimmed) handleSelect(trimmed)
                  }}
                  className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-white/[0.06] cursor-pointer"
                  forceMount
                >
                  <Search className="h-4 w-4 text-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-300">
                      Search for &quot;{search.trim().toUpperCase()}&quot;
                    </span>
                    <span className="ml-2 text-[10px] text-zinc-600">any Yahoo Finance symbol</span>
                  </div>
                  <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] text-zinc-500">↵</kbd>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Recent Searches */}
            {recents.length > 0 && (
              <CommandGroup heading="Recent">
                {recents.map((sym) => {
                  const item = findItem(sym)
                  return (
                    <CommandItem
                      key={`recent-${sym}`}
                      value={`${sym} ${item?.name || ""}`}
                      onSelect={() => handleSelect(sym)}
                      className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-white/[0.06] cursor-pointer"
                    >
                      <Clock className="h-4 w-4 text-zinc-600" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-zinc-300">{item?.name || sym}</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-600">{sym}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {recents.length > 0 && <CommandSeparator className="bg-white/[0.04] my-1" />}

            {/* Indices */}
            <CommandGroup heading="Indices">
              {INDICES.map((item) => (
                <CommandItem
                  key={item.symbol}
                  value={`${item.symbol} ${item.name}`}
                  onSelect={() => handleSelect(item.symbol)}
                  className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-white/[0.06] cursor-pointer"
                >
                  <SectorIcon sector={item.sector} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-600">{item.symbol}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-white/[0.04] my-1" />

            {/* Indian Stocks */}
            <CommandGroup heading="Indian Stocks (NSE)">
              {INDIAN_STOCKS.map((item) => (
                <CommandItem
                  key={item.symbol}
                  value={`${item.symbol} ${item.name} ${item.sector}`}
                  onSelect={() => handleSelect(item.symbol)}
                  className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-white/[0.06] cursor-pointer"
                >
                  <SectorIcon sector={item.sector} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-300">{item.name}</span>
                    <span className="ml-2 text-[10px] text-zinc-600">{item.sector}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-600">{item.symbol.replace(".NS", "")}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-white/[0.04] my-1" />

            {/* Crypto */}
            <CommandGroup heading="Crypto">
              {CRYPTO.map((item) => (
                <CommandItem
                  key={item.symbol}
                  value={`${item.symbol} ${item.name} crypto`}
                  onSelect={() => handleSelect(item.symbol)}
                  className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-white/[0.06] cursor-pointer"
                >
                  <SectorIcon sector={item.sector} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-600">{item.symbol.replace("-USD", "")}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1 font-mono text-[10px] text-zinc-500">↑</kbd>
                <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1 font-mono text-[10px] text-zinc-500">↓</kbd>
                <span className="text-[10px] text-zinc-600 ml-0.5">navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] text-zinc-500">↵</kbd>
                <span className="text-[10px] text-zinc-600 ml-0.5">select</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-400/60" />
              <span className="text-[10px] text-zinc-600">Fintola Search</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
