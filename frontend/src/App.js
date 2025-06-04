import React from 'react';
import TransfersForm from './TransfersForm';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '48px' }}>
      <h2 style={{ textAlign: 'center', color: '#2563eb', fontSize: '2rem', fontWeight: 700, marginBottom: '32px', letterSpacing: '0.01em' }}>
        Multicall Batch ERC-20 Transfers
      </h2>
      <TransfersForm />
    </div>
  );
}

export default App;