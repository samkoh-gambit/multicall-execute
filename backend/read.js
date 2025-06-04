const { ethers } = require("ethers");

// ABIs
const aggregateAbi = [
  "function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, bytes[] memory returnData)"
];
const erc20Abi = ["function balanceOf(address) view returns (uint256)"];

const aggregateInterface = new ethers.Interface(aggregateAbi);
const erc20Interface = new ethers.Interface(erc20Abi);

// Users and contracts
const userAddresses = [
  "0x382579A358c2Fbf329ae096b9Ef128987D3C93E1",
  "0xDE8728Cb15174B974e97d3FdA0AeEd6280BA358d"
];

const contractAddresses = [
  "0x4fD77Bc61A06fB4194Fa40245E090035FDAbb556"
];

// Generate calls for each user × contract
const calls = [];
for (const contract of contractAddresses) {
  for (const user of userAddresses) {
    calls.push({
      target: contract,
      callData: erc20Interface.encodeFunctionData("balanceOf", [user])
    });
  }
}

// Output for Etherscan input
console.log("✅ Use this in Etherscan 'aggregate' function input:");
console.log(JSON.stringify(calls, null, 2));

// Optional: Output raw encoded calldata (if needed for raw tx)
const encodedCall = aggregateInterface.encodeFunctionData("aggregate", [calls]);
console.log("\n✅ Raw Encoded Calldata:");
console.log(encodedCall);
