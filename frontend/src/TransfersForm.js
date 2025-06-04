import React, { useState } from 'react';
import axios from 'axios';

const blockExplorerBase = process.env.REACT_APP_BLOCK_EXPLORER_URL || 'https://amoy.polygonscan.com/tx/';
// const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/execute';
const apiUrl = '/api/execute';

function TransfersForm() {
  const [transfers, setTransfers] = useState([{ from: '', to: '', amount: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (idx, field, value) => {
    const newTransfers = [...transfers];
    newTransfers[idx][field] = value;
    setTransfers(newTransfers);
  };

  const handleAdd = () => setTransfers([...transfers, { from: '', to: '', amount: '' }]);
  const handleRemove = (idx) => setTransfers(transfers.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = transfers.map(t => ({
      ...t,
      amount: t.amount.toString()
    }));

    try {
      const res = await axios.post(apiUrl, { transfers: payload });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {transfers.map((t, idx) => (
        <div key={idx} className="transfer-row" style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <input
            placeholder="From (e.g. 0x0000...)"
            value={t.from}
            onChange={e => handleChange(idx, 'from', e.target.value)}
            required
            style={{ width: '360px' }}
          />
          <input
            placeholder="To (e.g. 0x0000...)"
            value={t.to}
            onChange={e => handleChange(idx, 'to', e.target.value)}
            required
            style={{ width: '360px' }}
          />
          <input
            placeholder="Amount (e.g. 0.05)"
            value={t.amount}
            onChange={e => handleChange(idx, 'amount', e.target.value)}
            required
            type="number"
            min="0"
            step="any"
            style={{ width: '120px' }}
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            disabled={transfers.length === 1}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', opacity: transfers.length === 1 ? 0.5 : 1 }}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="form-actions">
        <button type="button" onClick={handleAdd}>Add Transfer</button>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit Batch'}
        </button>
      </div>
      {result && result.success && result.result && result.result.hash && (
        <div className="success-message">
          <strong>Success!</strong>
          <div>
            Txn Hash:{' '}
            <a
              href={`${blockExplorerBase}${result.result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.result.hash}
            </a>
          </div>
        </div>
      )}
      {result && !result.success && (
        <div className="error-message">
          <strong>Error:</strong> {result.error}
        </div>
      )}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
    </form>
  );
}

export default TransfersForm;