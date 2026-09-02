// Vercel Serverless Function: api/inbox.js

let inMemoryInbox = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(inMemoryInbox);
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (body) {
      body.id = body.id || ('INQ-' + Date.now());
      body.date = body.date || new Date().toLocaleString();
      inMemoryInbox.unshift(body);
      return res.status(200).json({ success: true, message: 'Inquiry received' });
    }
    return res.status(400).json({ error: 'No data' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
