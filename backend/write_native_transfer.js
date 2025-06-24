const ethers = require("ethers");

// Native transfer instructions
const transfers = [
  {
    to: "0x5bC0A879A3941BBd59687Dd25B8926508D2C454d",
    amount: "0.05"
  },
  {
    to: "0xcC1BeFb8C1a4094cE3D967467b2d39Ab1225Ba23",
    amount: "0.04"
  },
  {
    to: "0xb133AaE811aa9727247dDad22926311c17181840",
    amount: "0.03"
  },
  { 
    to: "0xb9902CCc4228F5FC9879203312d2F220A29ACB40",
    amount: "0.02"
  },
  {
    to: "0x79eA795BaA7c06fF6A9e4E9C1dCA9aCAC58ED26a",
    amount: "0.01"
  }
];

// Build Call structs for aggregate
const calls = transfers.map(({ to, amount }) => ({
  target: to,
  callData: "0x", // empty for native transfer
  value: ethers.parseEther(amount).toString()
}));

// ABI for the aggregate function
const abi = [
  "function aggregate((address target, bytes callData, uint256 value)[] calls) public payable returns (uint256 blockNumber, bytes[] memory returnData)"
];
const iface = new ethers.Interface(abi);

// Encode the calldata for aggregate
const calldata = iface.encodeFunctionData("aggregate", [calls]);

// Calculate total value to send
const totalValue = calls.reduce((acc, c) => acc + BigInt(c.value), 0n);

console.log("✅ Calldata for aggregate:");
console.log(calldata);
console.log("\nTotal value to send (wei):", totalValue.toString());
console.log("Total value to send (ETH):", ethers.formatEther(totalValue));