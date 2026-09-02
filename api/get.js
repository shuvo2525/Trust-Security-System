// Vercel Serverless Function: api/get.js

const defaultContent = require('../data/site-data.json');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    // 1. Check Supabase / Cloud DB if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const cloudRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/trust_site_data?key_name=eq.site_main_data&select=data_content`, {
          headers: {
            'apikey': process.env.SUPABASE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
          }
        });
        if (cloudRes.ok) {
          const rows = await cloudRes.json();
          if (rows && rows.length > 0 && rows[0].data_content) {
            return res.status(200).json(JSON.parse(rows[0].data_content));
          }
        }
      } catch (e) {}
    }

    // 2. Check in-memory store
    if (global.__TRUST_SITE_DATA__) {
      return res.status(200).json(global.__TRUST_SITE_DATA__);
    }

    // 3. Fallback to default json
    return res.status(200).json(defaultContent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
