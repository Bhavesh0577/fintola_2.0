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
    const { screen = 'most_actives' } = req.query;
    const apiUrl = `${PYTHON_API_URL}/api/screener?screen=${encodeURIComponent(screen)}`;
    const response = await fetchWithTimeout(apiUrl, 30000);

    if (!response.ok) throw new Error(`Python API returned ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (error) {
    console.error('Screener API error:', error);
    res.status(500).json({ error: 'Failed to fetch screener', message: error.message, items: [] });
  }
}
