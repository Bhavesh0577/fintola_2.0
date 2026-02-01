// filepath: /c:/Users/bhave/fintola/src/pages/api/finance.js
// This proxies requests to the Python API hosted on Render

// Use environment variable for production, fallback to Render URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://ppio.onrender.com';

// For Vercel deployment, we use the /api/finance.py Python serverless function
const IS_VERCEL = process.env.VERCEL === '1';

export default async function handler(req, res) {
  try {
    // Get the symbol and type from the query parameters
    const { symbol = 'RELIANCE.NS', type = 'chart', period = '1mo', interval = '1d' } = req.query;

    let apiUrl;
    if (IS_VERCEL) {
      // On Vercel, call the Python serverless function directly
      // The Python function is at /api/finance (finance.py)
      apiUrl = `${PYTHON_API_URL}/api/finance?symbol=${encodeURIComponent(symbol)}&type=${type}&period=${period}&interval=${interval}`;
    } else {
      // Local development - call the Python FastAPI server
      apiUrl = `${PYTHON_API_URL}/api/finance?symbol=${encodeURIComponent(symbol)}&type=${type}&period=${period}&interval=${interval}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if Python API returned an error
    if (data.error) {
      throw new Error(data.error);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', message: error.message });
  }
}
