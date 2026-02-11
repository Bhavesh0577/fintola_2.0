"use client";

import React, { useState } from "react";
import { TradingViewChart } from "@/components/trading/trading-view-chart";
import { StockInfo } from "@/components/trading/stock-info";
import { WatchList } from "@/components/trading/watch-list";
import { TimeframeSelector } from "@/components/trading/timeframe-selector";
import { ToolBar } from "@/components/trading/tool-bar";
import { MarketIndices } from "@/components/trading/market-indices";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Settings, Bell } from "lucide-react";

export default function TradingViewPage() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [selectedSymbol, setSelectedSymbol] = useState<string>("TATASTEEL.NS");
    const [timeframe, setTimeframe] = useState<string>("1D");

    const handleSearch = () => {
        if (searchInput.trim()) {
            setSelectedSymbol(searchInput.trim().toUpperCase());
            setSearchInput("");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#131722] text-zinc-900 dark:text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-4 h-12 border-b border-zinc-200 dark:border-[#1e222d] bg-zinc-50 dark:bg-[#1a1e2d] shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold tracking-tight">Trading View</h1>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search symbol…"
                            value={searchInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                            className="w-56 h-8 pl-8 text-xs bg-zinc-100 dark:bg-[#131722] border-zinc-300 dark:border-[#2a2e39] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:border-[#2962FF]"
                        />
                        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <Button onClick={handleSearch} size="sm" className="h-8 text-xs bg-[#2962FF] hover:bg-[#1e53e5]">
                        Search
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2e39]">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2e39]">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Resizable layout */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left panel — Watchlist */}
                <ResizablePanel defaultSize={18} minSize={12} maxSize={30} className="bg-white dark:bg-[#131722]">
                    <div className="h-full overflow-y-auto">
                        <WatchList
                            selectedSymbol={selectedSymbol}
                            onSelectSymbol={(symbol) => setSelectedSymbol(symbol)}
                        />
                    </div>
                </ResizablePanel>

                <ResizableHandle className="w-px bg-zinc-200 dark:bg-[#1e222d] hover:bg-[#2962FF] transition-colors data-[resize-handle-active]:bg-[#2962FF]" />

                {/* Center panel — Chart */}
                <ResizablePanel defaultSize={82} minSize={50}>
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Stock info bar */}
                        <StockInfo symbol={selectedSymbol} />

                        {/* Chart controls */}
                        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-200 dark:border-[#1e222d]">
                            <TimeframeSelector
                                currentTimeframe={timeframe}
                                onTimeframeChange={(tf: string) => setTimeframe(tf)}
                            />
                            <ToolBar />
                        </div>

                        {/* Chart */}
                        <div className="flex-1 relative min-h-0">
                            <TradingViewChart symbol={selectedSymbol} timeframe={timeframe} />
                        </div>

                        {/* Market indices */}
                        <div className="border-t border-zinc-200 dark:border-[#1e222d] shrink-0">
                            <MarketIndices />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
} 