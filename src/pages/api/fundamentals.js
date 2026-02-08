const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://ppio.onrender.com';

async function fetchWithTimeout(url, timeoutMs = 45000) {
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
    const { symbol = 'RELIANCE.NS' } = req.query;
    const apiUrl = `${PYTHON_API_URL}/api/fundamentals?symbol=${encodeURIComponent(symbol)}`;
    const response = await fetchWithTimeout(apiUrl, 45000);

    if (!response.ok) throw new Error(`Python API returned ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (error) {
    console.error('Fundamentals API error:', error);
    res.status(500).json({ error: 'Failed to fetch fundamentals', message: error.message });
  }
}
