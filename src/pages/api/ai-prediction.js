// Use Python API for fetching finance data
// For Vercel, use the Python serverless function; for local, use FastAPI server
const PYTHON_API_URL = process.env.PYTHON_API_URL || (
    process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:8001'
);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
    try {
        const { symbol = 'TATASTEEL.NS' } = req.query;

        // Fetch historical data from Python API (works on both Vercel and local)
        const pythonApiUrl = `${PYTHON_API_URL}/api/finance?symbol=${encodeURIComponent(symbol)}&type=chart`;
        const response = await fetch(pythonApiUrl);
        
        if (!response.ok) {
            throw new Error(`Python API returned ${response.status}`);
        }
        
        const chartData = await response.json();
        
        if (chartData.error) {
            throw new Error(chartData.error);
        }

        // Process the data for AI analysis
        const processedData = processChartData(chartData);

        // Call Gemini API for prediction
        const predictions = await callGeminiAPI(processedData, symbol);

        res.status(200).json(predictions);
    } catch (error) {
        console.error('Error generating AI predictions:', error);
        res.status(500).json({ error: 'Failed to generate AI predictions', message: error.message });
    }
}

// Process chart data for AI analysis
function processChartData(chartData) {
    // Handle Python API format: { meta, timestamp, indicators: { quote: [{ open, high, low, close, volume }] } }
    if (!chartData || !chartData.timestamp || !chartData.indicators?.quote?.[0]) {
        return [];
    }

    const timestamps = chartData.timestamp;
    const quotes = chartData.indicators.quote[0];
    
    // Extract the last 30 data points for analysis
    const startIdx = Math.max(0, timestamps.length - 30);
    
    const processedData = [];
    for (let i = startIdx; i < timestamps.length; i++) {
        processedData.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i]
        });
    }

    return processedData;
}

// Call Gemini API for prediction
async function callGeminiAPI(stockData, symbol) {
    try {
        if (!GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found, using fallback analysis');
            return generateFallbackAnalysis(stockData, symbol);
        }

        // Calculate basic indicators for context
        const lastPrice = stockData[stockData.length - 1]?.close || 0;
        const prevPrice = stockData[stockData.length - 2]?.close || 0;
        const priceChange = lastPrice - prevPrice;
        const priceChangePercent = (priceChange / prevPrice) * 100;

        // Prepare data summary for Gemini
        const recentData = stockData.slice(-10).map(d => ({
            date: d.date,
            open: d.open?.toFixed(2),
            high: d.high?.toFixed(2),
            low: d.low?.toFixed(2),
            close: d.close?.toFixed(2),
            volume: d.volume
        }));

        // Calculate SMAs
        const prices = stockData.map(d => d.close);
        const sma5 = calculateSMA(prices, 5);
        const sma20 = calculateSMA(prices, 20);
        const currentSMA5 = sma5[sma5.length - 1] || 0;
        const currentSMA20 = sma20[sma20.length - 1] || 0;

        // Create compact data for Gemini (reduce token usage)
        const compactData = recentData.slice(-5).map(d => 
            `${d.date}: O=${d.open} H=${d.high} L=${d.low} C=${d.close} V=${d.volume}`
        ).join('\n');

        // Create prompt for Gemini - keep it concise
        const prompt = `Analyze ${symbol} stock and provide JSON response.

Data (last 5 days):
${compactData}

Indicators: Price=${lastPrice.toFixed(2)}, Change=${priceChangePercent.toFixed(2)}%, SMA5=${currentSMA5.toFixed(2)}, SMA20=${currentSMA20.toFixed(2)}, Trend=${currentSMA5 > currentSMA20 ? 'Bullish' : 'Bearish'}

Respond ONLY with valid JSON (no markdown):
{"summary":"max 50 chars","trend":"Bullish|Bearish|Neutral","momentum":"Strong|Moderate|Weak","prediction":"max 80 chars","signals":[{"type":"BUY|SELL","date":"YYYY-MM-DD","reason":"max 30 chars"}],"confidence":0-100}`;

        // Call Gemini API
        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API error:', geminiResponse.status, errorText);
            return generateFallbackAnalysis(stockData, symbol);
        }

        const geminiData = await geminiResponse.json();
        
        // Parse Gemini response
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            console.error('No response from Gemini');
            return generateFallbackAnalysis(stockData, symbol);
        }

        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.slice(7);
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.slice(3);
        }
        if (cleanedResponse.endsWith('```')) {
            cleanedResponse = cleanedResponse.slice(0, -3);
        }
        cleanedResponse = cleanedResponse.trim();

        // Try to fix incomplete JSON by finding the last valid closing brace
        let aiAnalysis;
        try {
            aiAnalysis = JSON.parse(cleanedResponse);
        } catch (parseError) {
            // Try to salvage partial JSON
            console.warn('Attempting to fix incomplete JSON response');
            try {
                // Find the last complete object structure
                let fixedJson = cleanedResponse;
                // If signals array is incomplete, try to close it
                if (fixedJson.includes('"signals"') && !fixedJson.includes(']}')) {
                    // Find last complete signal or empty array
                    const signalsStart = fixedJson.indexOf('"signals"');
                    const beforeSignals = fixedJson.substring(0, signalsStart);
                    fixedJson = beforeSignals + '"signals":[],"confidence":50}';
                } else if (!fixedJson.endsWith('}')) {
                    fixedJson += '"}';
                }
                aiAnalysis = JSON.parse(fixedJson);
            } catch (fixError) {
                console.error('Failed to parse Gemini response:', cleanedResponse);
                return generateFallbackAnalysis(stockData, symbol);
            }
        }

        // Convert AI signals to chart markers format
        const chartSignals = [];
        const lastFiveDays = stockData.slice(-5);
        
        if (aiAnalysis.signals && Array.isArray(aiAnalysis.signals)) {
            for (const signal of aiAnalysis.signals) {
                // Find the matching date in our data
                const matchingDay = lastFiveDays.find(d => d.date === signal.date);
                if (matchingDay) {
                    const timestamp = Math.floor(new Date(matchingDay.date).getTime() / 1000);
                    chartSignals.push({
                        time: timestamp,
                        position: signal.type === 'BUY' ? 'belowBar' : 'aboveBar',
                        color: signal.type === 'BUY' ? '#00BFFF' : '#FF1493',
                        shape: signal.type === 'BUY' ? 'arrowUp' : 'arrowDown',
                        text: `AI ${signal.type}`,
                        reason: signal.reason
                    });
                }
            }
        }

        // If no signals were matched, generate based on trend
        if (chartSignals.length === 0) {
            const latestDay = stockData[stockData.length - 1];
            const latestTimestamp = Math.floor(new Date(latestDay.date).getTime() / 1000);
            
            if (aiAnalysis.trend === 'Bullish') {
                chartSignals.push({
                    time: latestTimestamp,
                    position: 'belowBar',
                    color: '#00BFFF',
                    shape: 'arrowUp',
                    text: 'AI BUY'
                });
            } else if (aiAnalysis.trend === 'Bearish') {
                chartSignals.push({
                    time: latestTimestamp,
                    position: 'aboveBar',
                    color: '#FF1493',
                    shape: 'arrowDown',
                    text: 'AI SELL'
                });
            }
        }

        return {
            symbol,
            lastPrice,
            priceChange,
            priceChangePercent,
            analysis: {
                summary: aiAnalysis.summary || 'Analysis generated by Gemini AI',
                technicalIndicators: {
                    sma5: currentSMA5,
                    sma20: currentSMA20,
                    trend: aiAnalysis.trend || (currentSMA5 > currentSMA20 ? 'Bullish' : 'Bearish'),
                    momentum: aiAnalysis.momentum || (priceChange >= 0 ? 'Positive' : 'Negative')
                },
                prediction: aiAnalysis.prediction || 'AI prediction not available',
                confidence: aiAnalysis.confidence || 50,
                aiGenerated: true
            },
            signals: chartSignals
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return generateFallbackAnalysis(stockData, symbol);
    }
}

// Fallback analysis when Gemini API is unavailable
function generateFallbackAnalysis(stockData, symbol) {
    const lastPrice = stockData[stockData.length - 1]?.close || 0;
    const prevPrice = stockData[stockData.length - 2]?.close || 0;
    const priceChange = lastPrice - prevPrice;
    const priceChangePercent = (priceChange / prevPrice) * 100;

    const prices = stockData.map(d => d.close);
    const sma5 = calculateSMA(prices, 5);
    const sma20 = calculateSMA(prices, 20);
    const currentSMA5 = sma5[sma5.length - 1] || 0;
    const currentSMA20 = sma20[sma20.length - 1] || 0;
    const prevSMA5 = sma5[sma5.length - 2] || 0;
    const prevSMA20 = sma20[sma20.length - 2] || 0;

    const bullishCrossover = prevSMA5 <= prevSMA20 && currentSMA5 > currentSMA20;
    const bearishCrossover = prevSMA5 >= prevSMA20 && currentSMA5 < currentSMA20;

    const signals = [];
    const lastFiveDays = stockData.slice(-5);

    lastFiveDays.forEach((day, index) => {
        if (index === 0) return;
        const prevDay = lastFiveDays[index - 1];
        const timestamp = Math.floor(new Date(day.date).getTime() / 1000);

        if (day.close > prevDay.close && day.volume > prevDay.volume * 1.1) {
            signals.push({
                time: timestamp,
                position: 'belowBar',
                color: '#00BFFF',
                shape: 'arrowUp',
                text: 'AI BUY'
            });
        }

        if (day.close < prevDay.close && day.volume > prevDay.volume * 1.1) {
            signals.push({
                time: timestamp,
                position: 'aboveBar',
                color: '#FF1493',
                shape: 'arrowDown',
                text: 'AI SELL'
            });
        }
    });

    if (bullishCrossover) {
        const latestDay = stockData[stockData.length - 1];
        signals.push({
            time: Math.floor(new Date(latestDay.date).getTime() / 1000),
            position: 'belowBar',
            color: '#00BFFF',
            shape: 'arrowUp',
            text: 'AI BUY'
        });
    }

    if (bearishCrossover) {
        const latestDay = stockData[stockData.length - 1];
        signals.push({
            time: Math.floor(new Date(latestDay.date).getTime() / 1000),
            position: 'aboveBar',
            color: '#FF1493',
            shape: 'arrowDown',
            text: 'AI SELL'
        });
    }

    return {
        symbol,
        lastPrice,
        priceChange,
        priceChangePercent,
        analysis: {
            summary: priceChange >= 0 ?
                'The stock shows positive momentum with potential for further upside.' :
                'The stock shows negative momentum with potential for further downside.',
            technicalIndicators: {
                sma5: currentSMA5,
                sma20: currentSMA20,
                trend: currentSMA5 > currentSMA20 ? 'Bullish' : 'Bearish',
                momentum: priceChange >= 0 ? 'Positive' : 'Negative'
            },
            prediction: priceChange >= 0 ?
                'Based on recent price action and technical indicators, the stock may continue its upward trend in the short term.' :
                'Based on recent price action and technical indicators, the stock may continue its downward trend in the short term.',
            aiGenerated: false
        },
        signals
    };
}

// Calculate Simple Moving Average
function calculateSMA(data, period) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i >= period - 1) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        } else {
            sma.push(null);
        }
    }
    return sma;
} 