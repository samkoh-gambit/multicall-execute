const { createAuthCookie } = require('./auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, password } = req.body || {};
  const adminId = (process.env.ADMIN_ID || process.env.ADMIN_USER || '').trim();
  const adminPwd = (process.env.ADMIN_PWD || process.env.ADMIN_PASSWORD || '').trim();
  const inputId = typeof id === 'string' ? id.trim() : '';
  const inputPwd = typeof password === 'string' ? password.trim() : '';

  if (!adminId || !adminPwd) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  if (inputId === adminId && inputPwd === adminPwd) {
    res.setHeader('Set-Cookie', createAuthCookie(inputId));
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid ID or password' });
};
