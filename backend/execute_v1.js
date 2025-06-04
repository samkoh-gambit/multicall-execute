require("dotenv").config();
const ethers = require("ethers");

// ABIs
const erc20Abi = [
  "function transferFrom(address from, address to, uint256 amount)"
];
const erc20Interface = new ethers.Interface(erc20Abi);

// ERC-20 Token contract address from env
const tokenContract = process.env.TOKEN_CONTRACT;

// Transfer instructions
const transfers = [
  // {
  //   from: "0x15749571ccDbF8e335C464FfA542781e8E3078f2",
  //   to: "0x5bC0A879A3941BBd59687Dd25B8926508D2C454d",
  //   amount: ethers.parseUnits("0.05", 18)
  // },
  // {
  //   from: "0x15749571ccDbF8e335C464FfA542781e8E3078f2",
  //   to: "0xcC1BeFb8C1a4094cE3D967467b2d39Ab1225Ba23",
  //   amount: ethers.parseUnits("0.04", 18)
  // },
  {
    from: "0x15749571ccDbF8e335C464FfA542781e8E3078f2",
    to: "0xb133AaE811aa9727247dDad22926311c17181840",
    amount: ethers.parseUnits("0.03", 18)
  },
  // { 
  //   from: "0x15749571ccDbF8e335C464FfA542781e8E3078f2",
  //   to: "0xb9902CCc4228F5FC9879203312d2F220A29ACB40",
  //   amount: ethers.parseUnits("0.02", 18)
  // },
  // {
  //   from: "0x15749571ccDbF8e335C464FfA542781e8E3078f2",
  //   to: "0x79eA795BaA7c06fF6A9e4E9C1dCA9aCAC58ED26a",
  //   amount: ethers.parseUnits("0.01", 18)
  // }
];

// Build aggregate call
const calls = transfers.map(({ from, to, amount }) => ({
  target: tokenContract,
  callData: erc20Interface.encodeFunctionData("transferFrom", [from, to, amount])
}));

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

async function main() {
  console.log("'Aggregate' function input:");
  console.log(JSON.stringify(calls, null, 2));

  // Actually call the aggregate function
  try {
    const tx = await multicallContract.aggregate(calls);
    console.log("Transaction sent! Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction mined! Receipt:", receipt);
  } catch (err) {
    console.error("Error calling aggregate:", err);
  }
}

main();