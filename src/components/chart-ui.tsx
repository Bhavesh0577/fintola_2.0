"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

// Lazy-load the chart component (lightweight-charts ~45KB gzipped)
const StatsChart = dynamic(() => import("./stats-chart").then(m => ({ default: m.StatsChart })), {
  ssr: false,
  loading: () => <div className="h-[350px] rounded-xl bg-zinc-100 dark:bg-white/[0.04] animate-pulse" />,
});

interface ChartUIProps {
    symbol: string;
    title?: string;
}

export function ChartUI({ symbol, title }: ChartUIProps) {
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    useEffect(() => {
        const update = () =>
            setCurrentDateTime(
                new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                })
            );
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="w-full">
            <StatsChart symbol={symbol} />

            {/* Footer */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-indigo-400/60" />
                    <p className="text-[11px] text-zinc-600">
                        Enable <span className="text-indigo-400/80 font-medium">Gemini AI</span> for intelligent buy/sell signals
                    </p>
                </div>
                <p className="text-[10px] text-zinc-700">Last sync: {currentDateTime} IST · Not financial advice</p>
            </div>
        </div>
    );
} 