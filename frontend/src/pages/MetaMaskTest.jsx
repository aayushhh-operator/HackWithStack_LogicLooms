import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useWeb3 } from "../context/Web3Context";
import { useLoan } from "../hooks/useLoan";

export default function MetaMaskTest() {
  const {
    account,
    connectWallet,
    disconnectWallet,
    isConnected,
    loading: web3Loading,
  } = useWeb3();
  const {
    requestLoan,
    getLoan,
    getBorrowerLoans,
    getUserReputation,
    loading: loanLoading,
  } = useLoan();

  const [loans, setLoans] = useState([]);
  const [reputation, setReputation] = useState(0);
  const [loanForm, setLoanForm] = useState({
    amount: "1",
    interestRate: "5",
    duration: "30",
    purpose: "Business expansion",
  });

  // Load user data when connected
  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    }
  }, [isConnected, account]);

  const loadUserData = async () => {
    try {
      // Load user's loans
      const userLoans = await getBorrowerLoans(account);
      setLoans(userLoans);

      // Load user's reputation
      const rep = await getUserReputation(account);
      setReputation(rep);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();

    try {
      const result = await requestLoan(
        parseFloat(loanForm.amount),
        parseFloat(loanForm.interestRate),
        parseInt(loanForm.duration),
        loanForm.purpose
      );

      alert(
        `Loan requested successfully! ${
          result.loanId ? "Loan ID: " + result.loanId : ""
        }`
      );

      // Reload loans
      loadUserData();

      // Reset form
      setLoanForm({
        amount: "1",
        interestRate: "5",
        duration: "30",
        purpose: "Business expansion",
      });
    } catch (error) {
      alert("Error requesting loan: " + error.message);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">🦊 MetaMask Integration Test</h1>

      {/* Connection Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to interact with the smart contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div>
              <p className="mb-4 text-gray-600">Not connected to MetaMask</p>
              <Button
                onClick={connectWallet}
                disabled={web3Loading}
                className="w-full sm:w-auto"
              >
                {web3Loading ? "Connecting..." : "Connect MetaMask"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Connected Account:</p>
                <p className="font-mono text-lg">{account}</p>
                <p className="text-xs text-gray-500">
                  {formatAddress(account)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reputation Score:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reputation} / 100
                </p>
              </div>
              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <>
          {/* Request Loan Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Request a Loan</CardTitle>
              <CardDescription>
                Fill in the loan details to request a new loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestLoan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={loanForm.amount}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, amount: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={loanForm.interestRate}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          interestRate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={loanForm.duration}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, duration: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Purpose
                    </label>
                    <input
                      type="text"
                      value={loanForm.purpose}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, purpose: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., Business expansion"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loanLoading}
                  className="w-full sm:w-auto"
                >
                  {loanLoading ? "Processing..." : "Request Loan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loans List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Loans ({loans.length})</CardTitle>
              <CardDescription>All loans you've requested</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No loans found. Request your first loan above!
                </p>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Loan ID</p>
                          <p className="font-semibold">#{loan.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                              loan.status === "Requested"
                                ? "bg-yellow-100 text-yellow-800"
                                : loan.status === "Funded"
                                ? "bg-blue-100 text-blue-800"
                                : loan.status === "Repaid"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold">{loan.amount} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Interest Rate</p>
                          <p className="font-semibold">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Risk Score</p>
                          <p className="font-semibold">
                            {loan.riskScore} / 100
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-semibold">
                            {formatDate(loan.createdAt)}
                          </p>
                        </div>
                        {loan.lender !==
                          "0x0000000000000000000000000000000000000000" && (
                          <div className="sm:col-span-2">
                            <p className="text-sm text-gray-600">Lender</p>
                            <p className="font-mono text-sm">
                              {formatAddress(loan.lender)}
                            </p>
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-600">Purpose</p>
                          <p className="text-sm">{loan.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
