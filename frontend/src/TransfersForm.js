import React, { useState } from 'react';
import axios from 'axios';

const blockExplorerBases = {
  'polygon-amoy': process.env.REACT_APP_POLYGON_AMOY_BLOCK_EXPLORER_URL || 'https://amoy.polygonscan.com/tx/',
  'eth-sepolia': process.env.REACT_APP_ETH_SEPOLIA_BLOCK_EXPLORER_URL || 'https://sepolia.etherscan.io/tx/',
};

// const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001/api/execute';
const apiUrl = '/api/execute';

const CHAIN_CONFIG = {
  'polygon-amoy': {
    defaultFrom: process.env.REACT_APP_POLYGON_AMOY_DEFAULT_FROM || '',
  },
  'eth-sepolia': {
    defaultFrom: process.env.REACT_APP_ETH_SEPOLIA_DEFAULT_FROM || '',
  },
};

function TransfersForm() {
  const [chain, setChain] = useState('polygon-amoy');
  const [transfers, setTransfers] = useState([{ from: CHAIN_CONFIG['polygon-amoy'].defaultFrom, to: '', amount: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (idx, field, value) => {
    const newTransfers = [...transfers];
    newTransfers[idx][field] = value;
    setTransfers(newTransfers);
  };

  const handleAdd = () => setTransfers([...transfers, { from: CHAIN_CONFIG[chain].defaultFrom, to: '', amount: '' }]);
  const handleRemove = (idx) => setTransfers(transfers.filter((_, i) => i !== idx));

  const handleChainChange = (e) => {
    const selectedChain = e.target.value;
    setChain(selectedChain);
    setTransfers(transfers.map(t => ({ ...t, from: CHAIN_CONFIG[selectedChain].defaultFrom })));
    setResult(null);
    setError(null);
  };

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
      const res = await axios.post(apiUrl, { transfers: payload, chain });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.7rem', color: '#2563eb', fontWeight: 700, letterSpacing: '0.01em' }}>Batch ERC-20 Transfers</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="chain-select" style={{ fontWeight: 1000, color: '#374151' }}>Select Chain:</label>
          <select
            id="chain-select"
            value={chain}
            onChange={handleChainChange}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', background: '#f9fafb', color: '#2563eb', fontWeight: 600 }}
          >
            <option value="polygon-amoy">Polygon Amoy</option>
            <option value="eth-sepolia">Ethereum Sepolia</option>
          </select>
        </div>
      </div>
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
              href={`${blockExplorerBases[chain]}${result.result.hash}`}
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