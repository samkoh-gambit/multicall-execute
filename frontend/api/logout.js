const { clearAuthCookie } = require('./auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', clearAuthCookie(req));
  return res.json({ ok: true });
};
