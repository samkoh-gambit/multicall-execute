require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const execute = require('./execute'); // You will need to export a function from execute.js

const app = express();
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'multicallbn-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login', (req, res) => {
  const { id, password } = req.body || {};
  const adminId = (process.env.ADMIN_ID || process.env.ADMIN_USER || '').trim();
  const adminPwd = (process.env.ADMIN_PWD || process.env.ADMIN_PASSWORD || '').trim();
  const inputId = typeof id === 'string' ? id.trim() : '';
  const inputPwd = typeof password === 'string' ? password.trim() : '';

  if (!adminId || !adminPwd) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  if (inputId === adminId && inputPwd === adminPwd) {
    req.session.authenticated = true;
    req.session.user = inputId;
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid ID or password' });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Unauthorized' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.post('/api/execute', requireAuth, async (req, res) => {
    console.log('Received transfers:', req.body.transfers);
    try {
      const transfers = req.body.transfers;
      const chain = req.body.chain; 
      console.log('Calling execute...');
      const result = await execute(transfers, chain); 
      console.log('Execute finished:', result);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error in /api/execute:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));