"use client";

import React, { useState, useEffect } from "react";
import { StatsChart } from "../components/stats-chart";
import '../app/globals.css'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ChartUIProps {
  symbol: string;
  title?: string;
}

function ChartUI({ symbol, title }: ChartUIProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  // Update the date on the client side only
  useEffect(() => {
    setCurrentDateTime(new Date().toLocaleString());

    // Optional: Update the time every minute
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium mb-4">{title}</h3>
      )}

      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-400">Symbol:</span>
            <span className="ml-2 font-semibold">{symbol}</span>
          </div>

          <div className="text-sm text-gray-400">
            Last updated: {currentDateTime}
          </div>
        </div>

        <StatsChart symbol={symbol} />

        <div className="mt-4 text-xs text-gray-500">
          <p>Chart data provided by Yahoo Finance. Traditional signals are generated using EMA crossover strategy.</p>
          <p className="mt-1">
            <span className="text-purple-400 font-medium">Gemini AI Feature:</span> Click the "Use Gemini AI" button to enable AI-powered analysis and buy/sell signals using Google's Gemini Flash 1.5 model.
          </p>
          <p className="mt-2">This is for informational purposes only and should not be considered financial advice.</p>
        </div>
      </div>
    </div>
  );
}

// Create a proper page component that uses the ChartUI component
export default function TradePage() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("TATASTEEL.NS");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setIsSearching(true);
      // Format the search input to match Yahoo Finance symbol format
      let formattedSymbol = searchInput.trim().toUpperCase();
      if (!formattedSymbol.includes("-")) {
        // Check if it's likely a crypto symbol
        if (["BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "BNB", "USDT"].includes(formattedSymbol)) {
          formattedSymbol = `${formattedSymbol}-USD`;
        } else {
          // Assume it's a stock and add exchange if not present
          if (!formattedSymbol.includes(".")) {
            formattedSymbol = `${formattedSymbol}.NS`;
          }
        }
      }
      setSelectedSymbol(formattedSymbol);
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Trading Dashboard</h1>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search stock or crypto"
          className="bg-background/50 text-black placeholder:text-gray-400 border-gray-700"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <ChartUI symbol={selectedSymbol} title={`${selectedSymbol} Analysis`} />
      </div>
    </div>
  );
}