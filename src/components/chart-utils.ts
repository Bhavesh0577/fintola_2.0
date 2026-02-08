import { LineData, CandlestickData, UTCTimestamp } from "lightweight-charts";

export interface Quote {
    open: number;
    high: number;
    low: number;
    close: number;
    date: string;
}

export interface Marker {
    time: UTCTimestamp;
    position: "aboveBar" | "belowBar";
    color: string;
    shape: "arrowUp" | "arrowDown";
    text: string;
}

// Helper function to calculate a Simple Moving Average (SMA)
export const calculateSMA = (data: CandlestickData[], period: number): LineData[] => {
    const sma: LineData[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i >= period - 1) {
            const sum = data
                .slice(i - period + 1, i + 1)
                .reduce((acc, curr) => acc + curr.close, 0);
            sma.push({ time: data[i].time, value: sum / period });
        }
    }
    return sma;
};

// Helper function to calculate an Exponential Moving Average (EMA)
export const calculateEMA = (data: CandlestickData[], period: number): LineData[] => {
    const ema: LineData[] = [];
    const k = 2 / (period + 1);
    let prevEma = 0;
    for (let i = 0; i < data.length; i++) {
        if (i === period - 1) {
            // Initialize EMA using the SMA of the first 'period' data points
            const sum = data.slice(0, period).reduce((acc, curr) => acc + curr.close, 0);
            prevEma = sum / period;
            ema.push({ time: data[i].time, value: prevEma });
        } else if (i >= period) {
            const currentEma = data[i].close * k + prevEma * (1 - k);
            ema.push({ time: data[i].time, value: currentEma });
            prevEma = currentEma;
        }
    }
    return ema;
};

// Function to find buy/sell signals based on EMA crossovers
export const findSignals = (shortEMA: LineData[], longEMA: LineData[]): Marker[] => {
    const markers: Marker[] = [];
    for (let i = 1; i < shortEMA.length && i < longEMA.length; i++) {
        if (shortEMA[i - 1].value < longEMA[i - 1].value && shortEMA[i].value > longEMA[i].value) {
            markers.push({
                time: shortEMA[i].time as UTCTimestamp,
                position: "belowBar",
                color: "green",
                shape: "arrowUp",
                text: "BUY"
            });
        } else if (shortEMA[i - 1].value > longEMA[i - 1].value && shortEMA[i].value < longEMA[i].value) {
            markers.push({
                time: shortEMA[i].time as UTCTimestamp,
                position: "aboveBar",
                color: "red",
                shape: "arrowDown",
                text: "SELL"
            });
        }
    }
    return markers;
};

// Function to process API data into chart-compatible format
export const processChartData = (data: any): CandlestickData[] => {
    if (data && data.quotes && Array.isArray(data.quotes)) {
        return data.quotes
            .filter(
                (entry: Quote) =>
                    typeof entry.open === "number" &&
                    typeof entry.high === "number" &&
                    typeof entry.low === "number" &&
                    typeof entry.close === "number"
            )
            .map((entry: Quote) => ({
                time: new Date(entry.date).getTime() / 1000 as UTCTimestamp,
                open: entry.open,
                high: entry.high,
                low: entry.low,
                close: entry.close,
            }));
    } else if (data && data.timestamp && Array.isArray(data.timestamp) && data.indicators && data.indicators.quote) {
        const timestamps = data.timestamp;
        const quotes = data.indicators.quote[0];

        if (timestamps.length > 0 && quotes) {
            return timestamps.map((time: number, index: number) => ({
                time: time as UTCTimestamp,
                open: quotes.open[index] || 0,
                high: quotes.high[index] || 0,
                low: quotes.low[index] || 0,
                close: quotes.close[index] || 0,
            }));
        }
    }

    throw new Error("Unexpected data format");
};

// Chart configuration options
export const getChartOptions = (width: number) => ({
    width: width,
    height: 420,
    layout: {
        background: { color: "transparent" },
        textColor: "#71717a",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
    },
    grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
    },
    crosshair: {
        mode: 1,
        vertLine: {
            color: "rgba(99, 102, 241, 0.3)",
            width: 1 as any,
            style: 2,
            labelBackgroundColor: "#18181b",
        },
        horzLine: {
            color: "rgba(99, 102, 241, 0.3)",
            width: 1 as any,
            style: 2,
            labelBackgroundColor: "#18181b",
        },
    },
    rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.04)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: {
        borderColor: "rgba(255, 255, 255, 0.04)",
        timeVisible: true,
        secondsVisible: false,
    },
});

// Candlestick series options
export const getCandlestickOptions = () => ({
    upColor: "#34d399",
    downColor: "#f87171",
    borderVisible: false,
    wickUpColor: "#34d399",
    wickDownColor: "#f87171",
    borderUpColor: "#34d399",
    borderDownColor: "#f87171",
});

// SMA series options
export const getSMAOptions = () => ({
    color: "#f59e0b",
    lineWidth: 2,
});

// EMA series options
export const getEMAOptions = () => ({
    color: "#818cf8",
    lineWidth: 2,
}); 