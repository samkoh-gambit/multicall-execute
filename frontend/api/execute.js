const { ethers } = require("ethers");

// Vercel serverless function: /api/execute
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { transfers } = req.body;

  // ABIs
  const erc20Abi = [
    "function transferFrom(address from, address to, uint256 amount)"
  ];
  const erc20Interface = new ethers.Interface(erc20Abi);

  // ERC-20 Token contract address from env
  const tokenContract = process.env.TOKEN_CONTRACT;
  // MulticallBN contract address from env
  const multicallAddress = process.env.MULTICALL_ADDRESS;

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

  // Set up provider and signer from env
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Connect to the MulticallBN contract
  const multicallContract = new ethers.Contract(multicallAddress, multicallAbi, signer);

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
    target: tokenContract,
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