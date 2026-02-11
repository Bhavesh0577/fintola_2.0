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
    const { index = 'NIFTY 50' } = req.query;

    const apiUrl = `${PYTHON_API_URL}/api/nse-heatmap?index=${encodeURIComponent(index)}`;
    console.log(`Fetching NSE heatmap from: ${apiUrl}`);

    const response = await fetchWithTimeout(apiUrl, 30000);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Python API returned ${response.status}`,
        index,
      });
    }

    const data = await response.json();

    // Cache for 60 seconds on Vercel edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (error) {
    console.error('NSE heatmap proxy error:', error.message);
    return res.status(500).json({
      error: error.name === 'AbortError'
        ? 'Request timed out (Render may be cold-starting, try again in 30s)'
        : error.message,
      index: req.query.index || 'NIFTY 50',
    });
  }
}
