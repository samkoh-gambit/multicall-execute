import React, { useEffect, useState } from 'react';
import TransfersForm from './TransfersForm';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check-auth', { credentials: 'include' });
        setAuthenticated(res.ok);
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const tick = async () => {
      try {
        const res = await fetch('/api/check-auth', { credentials: 'include' });
        if (!res.ok) setAuthenticated(false);
      } catch {
        setAuthenticated(false);
      }
    };
    const intervalId = setInterval(tick, 120000);
    return () => clearInterval(intervalId);
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: id.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid ID or password');
        return;
      }
      setAuthenticated(true);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Checking authentication...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            padding: '28px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2563eb' }}>Sign in</h2>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="id" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>ID</label>
            <input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              autoComplete="username"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 42px 10px 10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ marginBottom: '12px', color: '#b91c1c', background: '#fee2e2', borderRadius: '6px', padding: '8px 10px' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Enter'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '48px' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--chain-primary, #2563eb)', fontSize: '2rem', fontWeight: 700, marginBottom: '32px', letterSpacing: '0.01em' }}>
        Multicall Batch ERC-20 Transfers
      </h2>
      <TransfersForm onSessionExpired={() => setAuthenticated(false)} />
    </div>
  );
}

export default App;