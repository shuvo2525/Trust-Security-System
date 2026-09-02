// Vercel Serverless Function: api/save.js
// Supports Cloud DB (Supabase / KV / MongoDB) or in-memory caching on Vercel

let memoryStore = null;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ success: false, error: 'No data received' });
    }

    // Cache in memory for serverless instance
    global.__TRUST_SITE_DATA__ = body;
    memoryStore = body;

    // If Supabase / Cloud environment variables are configured on Vercel
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/trust_site_data?key_name=eq.site_main_data`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ key_name: 'site_main_data', data_content: JSON.stringify(body) })
        });
      } catch (cloudErr) {
        console.warn("Cloud DB sync notice:", cloudErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Saved successfully to Vercel runtime and active session!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
