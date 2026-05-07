/** Colors used for headings, submit button (via CSS vars), and chain selector text */
export const CHAIN_THEME = {
  'polygon-amoy': {
    primary: '#8247E5',
    primaryStrong: '#6B3AC7',
    onPrimary: '#ffffff',
  },
  'polygon-mainnet': {
    primary: '#8247E5',
    primaryStrong: '#6B3AC7',
    onPrimary: '#ffffff',
  },
  'eth-sepolia': {
    primary: '#60a5fa',
    primaryStrong: '#3b82f6',
    onPrimary: '#ffffff',
  },
  'bsc-testnet': {
    primary: '#F0B90B',
    primaryStrong: '#d4a208',
    onPrimary: '#181a20',
  },
};

const NEUTRAL = {
  primary: '#2563eb',
  primaryStrong: '#1d4ed8',
  onPrimary: '#ffffff',
};

function tokensFor(chain) {
  return CHAIN_THEME[chain] || NEUTRAL;
}

/** Sets CSS variables for Submit Batch button only (see index.css). */
export function applyChainThemeToDocument(chain) {
  const t = tokensFor(chain);
  const root = document.documentElement;
  root.style.setProperty('--chain-primary', t.primary);
  root.style.setProperty('--chain-on-primary', t.onPrimary);
}

export function clearChainThemeFromDocument() {
  const root = document.documentElement;
  root.style.removeProperty('--chain-primary');
  root.style.removeProperty('--chain-on-primary');
}

export function getChainTheme(chain) {
  return tokensFor(chain);
}
