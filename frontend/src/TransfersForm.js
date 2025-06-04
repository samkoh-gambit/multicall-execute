import React, { useState } from 'react';
import axios from 'axios';

const blockExplorerBase = process.env.REACT_APP_BLOCK_EXPLORER_URL || 'https://amoy.polygonscan.com/tx/';

function TransfersForm() {
  const [transfers, setTransfers] = useState([
    { from: '', to: '', amount: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (idx, field, value) => {
    const newTransfers = [...transfers];
    newTransfers[idx][field] = value;
    setTransfers(newTransfers);
  };

  const handleAdd = () => {
    setTransfers([...transfers, { from: '', to: '', amount: '' }]);
  };

  const handleRemove = (idx) => {
    setTransfers(transfers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    // Convert amount to string to avoid precision issues
    const payload = transfers.map(t => ({
      ...t,
      amount: t.amount.toString()
    }));

    try {
      const res = await axios.post('http://localhost:4001/api/execute', { transfers: payload });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Batch ERC-20 Transfers</h2>
      {transfers.map((t, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <input
            placeholder="From"
            value={t.from}
            onChange={e => handleChange(idx, 'from', e.target.value)}
            style={{ width: 220, marginRight: 8 }}
            required
          />
          <input
            placeholder="To"
            value={t.to}
            onChange={e => handleChange(idx, 'to', e.target.value)}
            style={{ width: 220, marginRight: 8 }}
            required
          />
          <input
            placeholder="Amount (in Ether)"
            value={t.amount}
            onChange={e => handleChange(idx, 'amount', e.target.value)}
            style={{ width: 140, marginRight: 8 }}
            required
            type="number"
            min="0"
            step="any"
          />
          <button type="button" onClick={() => handleRemove(idx)} disabled={transfers.length === 1}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} style={{ marginRight: 8 }}>Add Transfer</button>
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Submit Batch'}</button>
      {result && result.success && result.result && result.result.hash && (
        <div style={{ marginTop: 16, color: 'green' }}>
          <strong>Success!</strong>
          <div>
            Txn Hash: <a href={`${blockExplorerBase}${result.result.hash}`} target="_blank" rel="noopener noreferrer">{result.result.hash}</a>
          </div>
        </div>
      )}
      {result && !result.success && (
        <div style={{ marginTop: 16, color: 'red' }}>
          <strong>Error:</strong> {result.error}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 16, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </form>
  );
}

export default TransfersForm;