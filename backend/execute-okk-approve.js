import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();


// --------- CONFIGURATION ---------
const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.POLYGON_TOKEN_CONTRACT;
const SPENDER_ADDRESS = process.env.POLYGON_MULTICALL_ADDRESS;
const AMOUNT = "10"; // 10 OKK
const RPC_URL = process.env.POLYGON_RPC_URL;


// --------- MAIN SCRIPT ---------
async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, erc20Abi, wallet);

  // Get decimals
  const decimals = await contract.decimals();
  const amount = ethers.parseUnits(AMOUNT, decimals);

  const tx = await contract.approve(SPENDER_ADDRESS, amount);
  console.log(`Transaction sent: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
