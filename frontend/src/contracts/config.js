// Contract deployed address
// IMPORTANT: Update this address after deploying to a persistent network
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Network configuration for local Hardhat network
export const NETWORK_CONFIG = {
  chainId: "0x539", // 1337 in hex (Hardhat actual default)
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
