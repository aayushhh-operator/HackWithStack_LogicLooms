import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../contracts/config";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      alert("Please install MetaMask browser extension");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Request account access
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network but don't force switch to avoid connection issues
      const network = await browserProvider.getNetwork();
      console.log("Current Chain ID:", network.chainId);
      const targetChainId = BigInt(NETWORK_CONFIG.chainId);
      
      if (network.chainId !== targetChainId) {
        console.warn("Wrong network! Please switch to Hardhat Local (Chain ID 31337)");
        alert("Please switch your wallet to the Hardhat Local network (Chain ID 31337)");
      }

      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();

      // Create contract instance
      console.log("Initializing contract with:", {
        address: CONTRACT_ADDRESS,
        abiLength: CONTRACT_ABI?.length,
        signer: signer?.address
      });

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setProvider(browserProvider);
      setAccount(accounts[0]);
      setContract(contractInstance);

      console.log("✅ Connected to MetaMask");
      console.log("Account:", accounts[0]);
      console.log("Contract:", CONTRACT_ADDRESS);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setProvider(null);
    setError(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && !account) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };

    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    account,
    contract,
    provider,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
};
