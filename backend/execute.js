require("dotenv").config();
const ethers = require("ethers");

// Chain configuration mapping
const CHAIN_CONFIG = {
  'polygon-amoy': {
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL,
    tokenContract: process.env.POLYGON_AMOY_TOKEN_CONTRACT,
    multicallAddress: process.env.POLYGON_AMOY_MULTICALL_ADDRESS,
    privateKey: process.env.POLYGON_AMOY_PRIVATE_KEY,
  },
  'eth-sepolia': {
    rpcUrl: process.env.ETH_SEPOLIA_RPC_URL,
    tokenContract: process.env.ETH_SEPOLIA_TOKEN_CONTRACT,
    multicallAddress: process.env.ETH_SEPOLIA_MULTICALL_ADDRESS,
    privateKey: process.env.ETH_SEPOLIA_PRIVATE_KEY,
  },
  'polygon-mainnet': {
    rpcUrl: process.env.POLYGON_RPC_URL,
    tokenContract: process.env.POLYGON_TOKEN_CONTRACT,
    multicallAddress: process.env.POLYGON_MULTICALL_ADDRESS,
    privateKey: process.env.POLYGON_PRIVATE_KEY,
  },
};

// ABIs
const erc20Abi = [
  "function transferFrom(address from, address to, uint256 amount)"
];
const erc20Interface = new ethers.Interface(erc20Abi);

// MulticallBN ABI (from your provided ABI)
const multicallAbi = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" }
        ],
        "internalType": "struct MulticallBN.Call[]",
        "name": "calls",
        "type": "tuple[]"
      }
    ],
    "name": "aggregate",
    "outputs": [
      { "internalType": "uint256", "name": "blockNumber", "type": "uint256" },
      { "internalType": "bytes[]", "name": "returnData", "type": "bytes[]" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

module.exports = async function execute(transfers, chain) {
  if (!chain || !CHAIN_CONFIG[chain]) {
    throw new Error('Invalid or missing chain parameter');
  }
  const config = CHAIN_CONFIG[chain];

  // Set up provider and signer from config
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);

  // Connect to the MulticallBN contract
  const multicallContract = new ethers.Contract(config.multicallAddress, multicallAbi, signer);

  // Validate addresses
  for (const t of transfers) {
    if (!ethers.isAddress(t.from)) {
      throw new Error(`Invalid 'from' address: ${t.from}`);
    }
    if (!ethers.isAddress(t.to)) {
      throw new Error(`Invalid 'to' address: ${t.to}`);
    }
  }

  // Build aggregate call from user-provided transfers
  const calls = transfers.map(({ from, to, amount }) => ({
    target: config.tokenContract,
    callData: erc20Interface.encodeFunctionData(
      "transferFrom",
      [from, to, ethers.parseUnits(amount, 18)]
    )
  }));

  try {
    const tx = await multicallContract.aggregate(calls);
    const receipt = await tx.wait();
    return { hash: tx.hash, receipt };
  } catch (err) {
    throw err;
  }
};