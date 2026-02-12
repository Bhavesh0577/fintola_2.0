// filepath: /c:/Users/bhave/fintola/src/pages/api/finance.js
// This proxies requests to the Python API hosted on Render

// Use environment variable for production, fallback to Render URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://ppio.onrender.com';

async function fetchWithTimeout(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  try {
    // Get the symbol and type from the query parameters
    const { symbol = 'RELIANCE.NS', type = 'chart', period = '1mo', interval = '1d', start, end } = req.query;

    let apiUrl = `${PYTHON_API_URL}/api/finance?symbol=${encodeURIComponent(symbol)}&type=${type}&period=${period}&interval=${interval}`;
    if (start) apiUrl += `&start=${encodeURIComponent(start)}`;
    if (end) apiUrl += `&end=${encodeURIComponent(end)}`;
    
    console.log(`Fetching from Python API: ${apiUrl}`);
    
    // Use 30s timeout to handle Render cold starts
    const response = await fetchWithTimeout(apiUrl, 30000);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Python API error: ${response.status} - ${errorText}`);
      throw new Error(`Python API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if Python API returned an error
    if (data.error) {
      throw new Error(data.error);
    }

    // Cache chart data: 5 min CDN cache, serve stale for 10 min while revalidating
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', message: error.message });
  }
}
