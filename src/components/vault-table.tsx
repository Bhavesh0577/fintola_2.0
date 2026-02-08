import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react";

// Define the type for market data
type MarketData = {
  name: string;
  symbol: string;
  price: string;
  daily: string;
  marketCap: string;
  peRatio: string;
  sector: "Banking" | "IT" | "Energy" | "Index" | "FMCG";
  lastUpdated: string;
  volatility: "high" | "medium" | "low";
}

// Define Indian stock symbols to fetch
const symbols = [
  "^NSEI", // Nifty 50
  "^BSESN", // Sensex
  "RELIANCE.NS", // Reliance Industries
  "HDFCBANK.NS", // HDFC Bank
  "TCS.NS", // Tata Consultancy Services
  "INFY.NS", // Infosys
  "SBIN.NS", // State Bank of India
  "TATASTEEL.NS", // Tata Steel
  "ICICIBANK.NS" // ICICI Bank
  // Hindustan Unilever
];

// Map for full names of indices
const indexNames: Record<string, string> = {
  "^NSEI": "Nifty 50",
  "^BSESN": "BSE Sensex"
};

// Map for sectors
const sectorMap: Record<string, "Banking" | "IT" | "Energy" | "Index" | "FMCG"> = {
  "^NSEI": "Index",
  "^BSESN": "Index",
  "RELIANCE.NS": "Energy",
  "HDFCBANK.NS": "Banking",
  "TCS.NS": "IT",
  "INFY.NS": "IT",
  "SBIN.NS": "Banking",
  "TATASTEEL.NS": "Energy",
  "ICICIBANK.NS": "Banking"
};

export function VaultTable() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);

        // Fetch data for each symbol
        const stockData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const response = await fetch(`/api/finance?symbol=${symbol}`);

              if (!response.ok) {
                throw new Error(`Failed to fetch data for ${symbol}`);
              }

              const data = await response.json();

              // Get the latest quote
              const quote = data.meta;
              const regularMarketPrice = quote.regularMarketPrice || 0;
              const previousClose = quote.previousClose || regularMarketPrice;
              const dailyChange = regularMarketPrice - previousClose;

              // Calculate P/E ratio (random for demo)
              const peRatio = (Math.random() * 30 + 10).toFixed(2);

              // Calculate market cap (random for demo)
              const marketCapValue = regularMarketPrice * (Math.random() * 1000000000 + 100000000);

              // Format market cap in billions/crores
              let marketCap = "";
              if (marketCapValue >= 1000000000) {
                marketCap = `₹${(marketCapValue / 1000000000).toFixed(2)}B`;
              } else {
                marketCap = `₹${(marketCapValue / 10000000).toFixed(2)}Cr`;
              }

              // Determine volatility based on trading volume
              let volatility: "high" | "medium" | "low" = "medium";
              if (quote.regularMarketVolume > 1000000) {
                volatility = "high";
              } else if (quote.regularMarketVolume < 100000) {
                volatility = "low";
              }

              // Format the price with ₹ and commas for Indian stocks
              const formattedPrice = `₹${regularMarketPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;

              // Format the daily change with + or - and ₹
              const formattedDaily = `${dailyChange >= 0 ? '+' : ''}₹${Math.abs(dailyChange).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;

              // Get current timestamp for last updated
              const now = new Date();
              const lastUpdated = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

              // Get the proper name for the symbol
              let name = quote.shortName || "";
              if (symbol.includes("^")) {
                name = indexNames[symbol] || name;
              }

              // Get the symbol without exchange suffix
              const cleanSymbol = symbol.includes(".") ? symbol.split(".")[0] : symbol.replace("^", "");

              return {
                name: name,
                symbol: cleanSymbol,
                price: formattedPrice,
                daily: formattedDaily,
                marketCap: marketCap,
                peRatio: peRatio,
                sector: sectorMap[symbol] || "Banking",
                lastUpdated: lastUpdated,
                volatility: volatility,
              };
            } catch (err) {
              console.error(`Error fetching data for ${symbol}:`, err);
              // Return a placeholder for failed fetches
              const cleanSymbol = symbol.includes(".") ? symbol.split(".")[0] : symbol.replace("^", "");
              return {
                name: indexNames[symbol] || symbol,
                symbol: cleanSymbol,
                price: "₹0.00",
                daily: "₹0.00",
                marketCap: "₹0.00",
                peRatio: "0.00",
                sector: sectorMap[symbol] || "Banking",
                lastUpdated: new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).replace(/\//g, '.'),
                volatility: "low" as "high" | "medium" | "low",
              };
            }
          })
        );

        setMarketData(stockData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch finance data:", err);
        setError("Failed to load financial data. Please try again later.");
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm text-zinc-500">Fetching live market data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.04] hover:bg-transparent">
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Stock</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Daily Change</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Market Cap</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">P/E Ratio</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Sector</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Last Updated</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Volatility</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marketData.map((stock) => (
            <TableRow key={stock.symbol} className="border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-xs font-bold text-zinc-400">
                    {stock.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{stock.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{stock.price}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-sm font-semibold ${stock.daily.includes('+') ? "text-emerald-400" : "text-rose-400"}`}>
                  {stock.daily}
                </span>
              </TableCell>
              <TableCell className="text-sm text-zinc-400">{stock.marketCap}</TableCell>
              <TableCell className="text-sm text-zinc-400">{stock.peRatio}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                    stock.sector === "Banking" ? "bg-blue-500/10 text-blue-400 ring-blue-500/20" :
                    stock.sector === "IT" ? "bg-violet-500/10 text-violet-400 ring-violet-500/20" :
                    stock.sector === "Energy" ? "bg-amber-500/10 text-amber-400 ring-amber-500/20" :
                    stock.sector === "Index" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" :
                    "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                  }`}
                >
                  {stock.sector}
                </span>
              </TableCell>
              <TableCell className="text-xs text-zinc-500">{stock.lastUpdated}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-3 rounded-full ${
                        i < (stock.volatility === "high" ? 3 : stock.volatility === "medium" ? 2 : 1)
                          ? stock.volatility === "high" ? "bg-rose-400" : stock.volatility === "medium" ? "bg-amber-400" : "bg-emerald-400"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

