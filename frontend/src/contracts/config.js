// Contract deployed address
// IMPORTANT: Update this address after deploying the contract
// Run: npx hardhat ignition deploy ignition/modules/MicroLending.js --network localhost
// Then copy the deployed contract address here
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Network configuration for local Hardhat network
export const NETWORK_CONFIG = {
  chainId: "0x539", // 1337 in hex (Hardhat default)
  chainName: "Hardhat Local",
  rpcUrls: ["http://127.0.0.1:8545"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// Import the ABI from the compiled contract
import contractABI from "./MicroLending.json";
export const CONTRACT_ABI = contractABI.abi;
