require("dotenv").config();
const ethers = require("ethers");

// Set up provider and signer from env
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Multicall contract address (replace with your deployed address)
const MULTICALL_NATIVE_TRANSFER_CONTRACT_ADDRESS = "0xE75A5Cc0FB5D5079e5800157dfbBc07a6Bf54d93";

// Native transfer instructions
const transfers = [
  {
    to: "0x459Bd63e1574D4633877ca002063DadC3C61394f",
    amount: "0.001" 
  },
  {
    to: "0x459Bd63e1574D4633877ca002063DadC3C61394f",
    amount: "0.001" 
  },
  {
    to: "0x459Bd63e1574D4633877ca002063DadC3C61394f",
    amount: "0.001" 
  },
];

async function main() {
  // Prepare calls array
  const calls = transfers.map(({ to, amount }) => ({
    target: to,
    callData: "0x",
    value: ethers.parseEther(amount).toString()
  }));

  // ABI for aggregate
  const abi = [
    "function aggregate((address target, bytes callData, uint256 value)[] calls) public payable returns (uint256 blockNumber, bytes[] memory returnData)"
  ];
  const iface = new ethers.Interface(abi);

  // Encode calldata
  const calldata = iface.encodeFunctionData("aggregate", [calls]);

  // Calculate total value
  const totalValue = calls.reduce((acc, c) => acc + BigInt(c.value), 0n);

  // Send transaction to Multicall contract
  try {
    const tx = await signer.sendTransaction({
      to: MULTICALL_NATIVE_TRANSFER_CONTRACT_ADDRESS,
      data: calldata,
      value: totalValue
    });
    console.log(`Multicall transaction sent! Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction mined! Receipt:`, receipt);
  } catch (err) {
    console.error(`Error sending multicall:`, err);
  }
}

main();