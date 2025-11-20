import { ethers } from "ethers";
import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export const useLoan = () => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request a loan
  const requestLoan = async (amount, interestRate, duration, purpose) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    setLoading(true);
    setError(null);

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const interestRateBP = interestRate * 100; // Convert to basis points
      const durationSeconds = duration * 24 * 60 * 60; // Days to seconds

      console.log("Requesting loan:", {
        amount: amount + " ETH",
        interestRate: interestRate + "%",
        duration: duration + " days",
        purpose,
      });

      const tx = await contract.requestLoan(
        amountWei,
        interestRateBP,
        durationSeconds,
        purpose
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Try to extract loan ID from events
      let loanId = null;
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            if (parsedLog && parsedLog.name === "LoanRequested") {
              loanId = parsedLog.args.loanId;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        console.warn("Could not extract loan ID from event");
      }

      return { tx, receipt, loanId };
    } catch (err) {
      console.error("Error requesting loan:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fund a loan
  const fundLoan = async (loanId, amountInWei) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    setLoading(true);
    setError(null);

    try {
      // amountInWei is already a string in wei format from the contract
      console.log("Funding loan:", {
        loanId: loanId.toString(),
        amountWei: amountInWei,
        amountEth: ethers.formatEther(amountInWei) + " ETH",
      });

      const tx = await contract.fundLoan(loanId, { value: amountInWei });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return { tx, receipt };
    } catch (err) {
      console.error("Error funding loan:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Repay a loan
  const repayLoan = async (loanId) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    setLoading(true);
    setError(null);

    try {
      // First calculate the repayment amount
      const repaymentAmount = await contract.calculateRepaymentAmount(loanId);

      console.log("Repaying loan:", {
        loanId: loanId.toString(),
        amount: ethers.formatEther(repaymentAmount) + " ETH",
      });

      const tx = await contract.repayLoan(loanId, { value: repaymentAmount });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return { tx, receipt, repaymentAmount };
    } catch (err) {
      console.error("Error repaying loan:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a loan
  const cancelLoan = async (loanId) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.cancelLoan(loanId);
      const receipt = await tx.wait();
      return { tx, receipt };
    } catch (err) {
      console.error("Error cancelling loan:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get loan details
  const getLoan = async (loanId) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    try {
      const loan = await contract.getLoan(loanId);

      return {
        id: loan[0].toString(),
        borrower: loan[1],
        lender: loan[2],
        amount: ethers.formatEther(loan[3]),
        interestRate: Number(loan[4]) / 100, // Convert from basis points
        duration: Number(loan[5]),
        dueDate: Number(loan[6]),
        repaidAmount: ethers.formatEther(loan[7]),
        status: Number(loan[8]), // FIXED: Status is at index 8
        statusLabel: [
          "Requested",
          "Funded",
          "Repaid",
          "Defaulted",
          "Cancelled",
        ][Number(loan[8])],
        riskScore: Number(loan[9]), // FIXED: Risk score is at index 9
        createdAt: Number(loan[10]),
        purpose: loan[11],
      };
    } catch (err) {
      console.error("Error getting loan:", err);
      throw err;
    }
  };

  // Get borrower's loans
  const getBorrowerLoans = async (address) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    try {
      const loanIds = await contract.getBorrowerLoans(address);

      // Return empty array if no loans
      if (!loanIds || loanIds.length === 0) {
        return [];
      }

      const loans = [];
      for (let loanId of loanIds) {
        try {
          const loan = await getLoan(loanId);
          loans.push(loan);
        } catch (loanErr) {
          console.warn(`Failed to fetch loan ${loanId}:`, loanErr);
          // Continue with other loans
        }
      }

      return loans;
    } catch (err) {
      console.error("Error getting borrower loans:", err);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  };

  // Get lender's loans
  const getLenderLoans = async (address) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    try {
      const loanIds = await contract.getLenderLoans(address);

      // Return empty array if no loans
      if (!loanIds || loanIds.length === 0) {
        return [];
      }

      const loans = [];
      for (let loanId of loanIds) {
        try {
          const loan = await getLoan(loanId);
          loans.push(loan);
        } catch (loanErr) {
          console.warn(`Failed to fetch loan ${loanId}:`, loanErr);
          // Continue with other loans
        }
      }

      return loans;
    } catch (err) {
      console.error("Error getting lender loans:", err);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  };

  // Calculate repayment amount
  const calculateRepayment = async (loanId) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    try {
      const amount = await contract.calculateRepaymentAmount(loanId);
      return ethers.formatEther(amount);
    } catch (err) {
      console.error("Error calculating repayment:", err);
      throw err;
    }
  };

  // Get user reputation
  const getUserReputation = async (address) => {
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    try {
      const reputation = await contract.userReputation(address);
      return Number(reputation);
    } catch (err) {
      console.error("Error getting reputation:", err);
      // Return 0 instead of throwing to prevent UI crash
      return 0;
    }
  };

  return {
    requestLoan,
    fundLoan,
    repayLoan,
    cancelLoan,
    getLoan,
    getBorrowerLoans,
    getLenderLoans,
    calculateRepayment,
    getUserReputation,
    getReputation: getUserReputation, // Alias for compatibility
    loading,
    error,
  };
};
