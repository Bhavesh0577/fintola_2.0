"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from "lightweight-charts";
import {
  calculateSMA,
  calculateEMA,
  findSignals,
  processChartData,
  getChartOptions,
  getCandlestickOptions,
  getSMAOptions,
  getEMAOptions,
  Marker
} from "./chart-utils";
import { DateRangePicker } from "./date-range-picker";
import type { DateRange } from "react-day-picker";

interface StatsChartProps {
  symbol?: string;
}

interface AIAnalysis {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  analysis: {
    summary: string;
    technicalIndicators: {
      sma5: number;
      sma20: number;
      trend: string;
      momentum: string;
    };
    prediction: string;
  };
  signals: Marker[];
}

export function StatsChart({ symbol = "TATASTEEL.NS" }: StatsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Local state
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Function to fetch data for a specific symbol
  const fetchSymbolData = async (symbolToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/finance?symbol=${symbolToFetch}`;
      if (dateRange?.from) {
        const fromStr = dateRange.from.toISOString().split("T")[0];
        url += `&start=${fromStr}`;
        if (dateRange.to) {
          const toStr = dateRange.to.toISOString().split("T")[0];
          url += `&end=${toStr}`;
        }
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbolToFetch}`);
      }

      const data = await response.json();
      const formattedData = processChartData(data);

      setChartData(formattedData);

      // Update the candlestick series with new data
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to fetch data for ${symbolToFetch}. Please try another symbol.`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch AI predictions
  const fetchAIPredictions = async (symbolToFetch: string) => {
    setAiLoading(true);
    try {
      const response = await fetch(`/api/ai-prediction?symbol=${symbolToFetch}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch AI predictions for ${symbolToFetch}`);
      }

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error("Error fetching AI predictions:", err);
      setError(`Failed to fetch AI predictions for ${symbolToFetch}.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Function to update markers based on current settings
  const updateMarkers = () => {
    if (!chartData.length || !chartRef.current || !candlestickSeriesRef.current) return;

    // Calculate short and long EMAs for traditional signals
    const shortEMA = calculateEMA(chartData, 3);
    const longEMA = calculateEMA(chartData, 30);

    // Find crossover points for traditional buy/sell signals
    const traditionalSignals = findSignals(shortEMA, longEMA);

    let markers: Marker[] = traditionalSignals;

    // If AI is enabled and we have AI signals, use those instead
    if (useAI && aiAnalysis && aiAnalysis.signals) {
      markers = aiAnalysis.signals;
    }

    // Add buy/sell markers to the candlestick series
    candlestickSeriesRef.current.setMarkers(markers);
  };

  // Effect to add buy/sell signals when chart data changes
  useEffect(() => {
    if (!chartData.length || !chartRef.current) return;
    const chart = chartRef.current;

    // Calculate short and long EMAs
    const shortEMA = calculateEMA(chartData, 3);
    const longEMA = calculateEMA(chartData, 30);

    // Add EMA series to the chart
    const shortEMASeries = chart.addLineSeries({
      color: "#00ff00",
      lineWidth: 2 as any // Type assertion to fix the linter error
    });
    const longEMASeries = chart.addLineSeries({
      color: "#ff0000",
      lineWidth: 2 as any // Type assertion to fix the linter error
    });

    shortEMASeries.setData(shortEMA);
    longEMASeries.setData(longEMA);

    // Update markers based on current settings
    updateMarkers();

    return () => {
      chart.removeSeries(shortEMASeries);
      chart.removeSeries(longEMASeries);
    };
  }, [chartData]);

  // Effect to update markers when useAI changes
  useEffect(() => {
    if (useAI && !aiAnalysis) {
      // Fetch AI predictions if they haven't been fetched yet
      fetchAIPredictions(symbol);
    } else {
      // Update markers based on current settings
      updateMarkers();
    }
  }, [useAI, aiAnalysis]);

  // Chart creation (runs once on mount)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart with a dark theme
    const chart = createChart(
      chartContainerRef.current,
      getChartOptions(chartContainerRef.current.offsetWidth)
    );
    chartRef.current = chart;

    // Add the candlestick series
    const candlestickSeries = chart.addCandlestickSeries(getCandlestickOptions());
    candlestickSeriesRef.current = candlestickSeries;

    // Initial data fetch
    fetchSymbolData(symbol);

    // Handle responsive resizing using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          chart.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect();
      chartRef.current?.remove();
    };
  }, []);

  // Effect to refetch data when symbol changes
  useEffect(() => {
    if (chartRef.current && candlestickSeriesRef.current) {
      fetchSymbolData(symbol);
      // Reset AI analysis when symbol changes
      setAiAnalysis(null);
      if (useAI) {
        fetchAIPredictions(symbol);
      }
    }
  }, [symbol, dateRange]);

  // Effect to add or remove indicators when toggles change or when data is available
  useEffect(() => {
    if (!chartData.length || !chartRef.current) return;
    const chart = chartRef.current;

    // Toggle SMA indicator
    if (showSMA) {
      if (!smaSeriesRef.current) {
        const smaOptions = getSMAOptions();
        const smaSeries = chart.addLineSeries({
          color: smaOptions.color,
          lineWidth: smaOptions.lineWidth as any // Type assertion to fix the linter error
        });
        smaSeriesRef.current = smaSeries;
      }
      const smaData = calculateSMA(chartData, 14);
      smaSeriesRef.current?.setData(smaData);
    } else {
      if (smaSeriesRef.current) {
        chart.removeSeries(smaSeriesRef.current);
        smaSeriesRef.current = null;
      }
    }

    // Toggle EMA indicator
    if (showEMA) {
      if (!emaSeriesRef.current) {
        const emaOptions = getEMAOptions();
        const emaSeries = chart.addLineSeries({
          color: emaOptions.color,
          lineWidth: emaOptions.lineWidth as any // Type assertion to fix the linter error
        });
        emaSeriesRef.current = emaSeries;
      }
      const emaData = calculateEMA(chartData, 14);
      emaSeriesRef.current?.setData(emaData);
    } else {
      if (emaSeriesRef.current) {
        chart.removeSeries(emaSeriesRef.current);
        emaSeriesRef.current = null;
      }
    }
  }, [chartData, showSMA, showEMA]);

  return (
    <div className="space-y-4">
      {/* Indicator Toggle Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowSMA((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ring-1 ring-inset ${
            showSMA
              ? "bg-amber-500/10 text-amber-400 ring-amber-500/25"
              : "bg-zinc-100 dark:bg-white/[0.03] text-zinc-500 ring-zinc-200 dark:ring-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.06] hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${showSMA ? "bg-amber-400" : "bg-zinc-600"}`} />
          SMA
        </button>
        <button
          onClick={() => setShowEMA((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ring-1 ring-inset ${
            showEMA
              ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/25"
              : "bg-zinc-100 dark:bg-white/[0.03] text-zinc-500 ring-zinc-200 dark:ring-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.06] hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${showEMA ? "bg-indigo-400" : "bg-zinc-600"}`} />
          EMA
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-white/[0.06] mx-1 hidden sm:block" />

        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div className="h-4 w-px bg-zinc-200 dark:bg-white/[0.06] mx-1 hidden sm:block" />

        <button
          onClick={() => setUseAI((prev) => !prev)}
          disabled={aiLoading}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ring-1 ring-inset ${
            useAI
              ? "bg-violet-500/15 text-violet-300 ring-violet-500/30 shadow-sm shadow-violet-500/10"
              : "bg-zinc-100 dark:bg-white/[0.03] text-zinc-500 ring-zinc-200 dark:ring-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.06] hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {aiLoading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-transparent border-t-violet-400" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M8 0L9.55 5.15L15 6L10.5 9.85L11.8 15.3L8 12L4.2 15.3L5.5 9.85L1 6L6.45 5.15L8 0Z" />
              </svg>
              <span>{useAI ? "Gemini AI Active" : "Gemini AI"}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-[420px] gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
          </div>
          <span className="text-xs text-zinc-600">Loading chart data…</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col justify-center items-center h-[420px] gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-rose-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Chart Canvas */}
      <div
        ref={chartContainerRef}
        className="rounded-lg overflow-hidden"
        style={{
          position: "relative",
          display: loading || error ? "none" : "block",
        }}
      />

      {/* AI Analysis Panel */}
      {useAI && aiAnalysis && (
        <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] backdrop-blur-sm overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-violet-500/10">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/15">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-violet-400">
                  <path d="M8 0L9.55 5.15L15 6L10.5 9.85L11.8 15.3L8 12L4.2 15.3L5.5 9.85L1 6L6.45 5.15L8 0Z" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-violet-300">Gemini AI · {aiAnalysis.symbol}</span>
            </div>
            <span className="text-[10px] text-zinc-600 font-medium">Google Gemini Flash 1.5</span>
          </div>

          {/* Panel Body */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Summary + Prediction */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1.5">Market Summary</h5>
                  <p className="text-[13px] leading-relaxed text-zinc-400">{aiAnalysis.analysis.summary}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1.5">AI Prediction</h5>
                  <p className="text-[13px] leading-relaxed text-zinc-400">{aiAnalysis.analysis.prediction}</p>
                </div>
              </div>

              {/* Right: Technical Indicators */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-2">Technical Indicators</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.04] px-3 py-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-600 block">SMA (5)</span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{aiAnalysis.analysis.technicalIndicators.sma5.toFixed(2)}</span>
                    </div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.04] px-3 py-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-600 block">SMA (20)</span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{aiAnalysis.analysis.technicalIndicators.sma20.toFixed(2)}</span>
                    </div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.04] px-3 py-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-600 block">Trend</span>
                      <span className={`text-sm font-semibold ${aiAnalysis.analysis.technicalIndicators.trend === "Bullish" ? "text-emerald-400" : "text-rose-400"}`}>
                        {aiAnalysis.analysis.technicalIndicators.trend}
                      </span>
                    </div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] ring-1 ring-zinc-200 dark:ring-white/[0.04] px-3 py-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-600 block">Momentum</span>
                      <span className={`text-sm font-semibold ${aiAnalysis.analysis.technicalIndicators.momentum === "Positive" ? "text-emerald-400" : "text-rose-400"}`}>
                        {aiAnalysis.analysis.technicalIndicators.momentum}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signal Legend */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00BFFF]"></span>
                    <span className="text-[11px] text-zinc-500">AI Buy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#FF1493]"></span>
                    <span className="text-[11px] text-zinc-500">AI Sell</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsChart;
