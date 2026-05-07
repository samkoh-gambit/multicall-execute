const { isAuthenticated } = require('./auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isAuthenticated(req)) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Unauthorized' });
};
