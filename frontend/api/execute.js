const { ethers } = require("ethers");

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

// Vercel serverless function: /api/execute
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { transfers, chain } = req.body;

  if (!chain || !CHAIN_CONFIG[chain]) {
    return res.status(400).json({ success: false, error: 'Invalid or missing chain parameter' });
  }

  const config = CHAIN_CONFIG[chain];

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

  // Set up provider and signer from config
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);

  // Connect to the MulticallBN contract
  const multicallContract = new ethers.Contract(config.multicallAddress, multicallAbi, signer);

  // Validate addresses
  for (const t of transfers) {
    if (!ethers.isAddress(t.from)) {
      return res.status(400).json({ success: false, error: `Invalid 'from' address: ${t.from}` });
    }
    if (!ethers.isAddress(t.to)) {
      return res.status(400).json({ success: false, error: `Invalid 'to' address: ${t.to}` });
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
    return res.status(200).json({ success: true, result: { hash: tx.hash, receipt } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};