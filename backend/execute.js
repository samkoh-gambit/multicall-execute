require("dotenv").config();
const ethers = require("ethers");

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

module.exports = async function execute(transfers) {
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
    target: tokenContract,
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