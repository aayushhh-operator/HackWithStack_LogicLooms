import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  RefreshCw,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../contexts/AuthContext";
import { useLoan } from "../hooks/useLoan";

const BorrowerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, connectWallet, isConnected } = useWeb3();
  const {
    getBorrowerLoans,
    requestLoan,
    repayLoan,
    calculateRepayment,
    loading: loanLoading,
  } = useLoan();

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: "",
    duration: "30",
    purpose: "",
    interestRate: "10",
  });

  // Fetch loans from blockchain
  const fetchMyLoans = async () => {
    if (!account || !isConnected) return;

    setLoading(true);
    try {
      const loans = await getBorrowerLoans(account);
      // Sort by ID descending (most recent first)
      const sortedLoans = loans.sort((a, b) => Number(b.id) - Number(a.id));
      setMyLoans(sortedLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch loans on mount and when account changes
  useEffect(() => {
    if (isConnected && account) {
      fetchMyLoans();
    }
  }, [isConnected, account]);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmitLoan = async () => {
    if (!loanForm.amount || parseFloat(loanForm.amount) <= 0) {
      alert("Please enter a valid loan amount");
      return;
    }
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Confirmation dialog with details
    const confirmed = confirm(
      `Confirm Loan Request:\n\n` +
        `Amount: ${loanForm.amount} ETH\n` +
        `Interest Rate: ${loanForm.interestRate}%\n` +
        `Duration: ${loanForm.duration} days\n` +
        `Purpose: ${loanForm.purpose || "Not specified"}\n\n` +
        `Do you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting loan request:", {
        amount: loanForm.amount,
        interestRate: loanForm.interestRate,
        duration: loanForm.duration,
        purpose: loanForm.purpose,
      });

      await requestLoan(
        loanForm.amount,
        loanForm.interestRate,
        loanForm.duration,
        loanForm.purpose
      );
      alert(`Loan request submitted for ${loanForm.amount} ETH!`);
      setShowLoanModal(false);
      setLoanForm({
        amount: "",
        duration: "30",
        purpose: "",
        interestRate: "10",
      });
      await fetchMyLoans(); // Refresh loans
    } catch (error) {
      console.error("Error submitting loan:", error);
      alert(`Failed to submit loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLoanDetails = (loanId) => {
    const loan = myLoans.find((l) => l.id === loanId);
    if (loan) {
      setSelectedLoan(loan);
    }
  };

  const handleRepayLoan = async (loanId) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      const repaymentAmount = await calculateRepayment(loanId);
      const confirmed = confirm(
        `Repay loan ${loanId} with ${repaymentAmount} ETH?`
      );

      if (confirmed) {
        await repayLoan(loanId);
        alert("Loan repaid successfully!");
        await fetchMyLoans(); // Refresh loans
      }
    } catch (error) {
      console.error("Error repaying loan:", error);
      alert(`Failed to repay loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from blockchain data
  const totalBorrowed = myLoans.reduce((sum, loan) => {
    return sum + parseFloat(loan.amount || 0);
  }, 0);

  const activeLoans = myLoans.filter((loan) => loan.status === 1).length; // Status 1 = Funded
  const allOnTime = myLoans.every((loan) => loan.status !== 3); // Status 3 = Defaulted

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">
                Borrower Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {account ? (
                <div className="glass-card px-3 py-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              ) : (
                <button onClick={connectWallet} className="btn-outline text-sm">
                  Connect Wallet
                </button>
              )}
              <button
                onClick={() => navigate("/profile")}
                className="btn-outline text-sm"
              >
                Profile
              </button>
              <button onClick={handleLogout} className="btn-outline text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Stats Section - Compact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Total Borrowed</div>
                <div className="text-lg font-bold text-black">
                  {totalBorrowed.toFixed(4)} ETH
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Active Loans</div>
                <div className="text-lg font-bold text-black">
                  {activeLoans}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Total Loans</div>
                <div className="text-lg font-bold text-black">
                  {myLoans.length}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Status</div>
                <div className="text-sm font-bold text-black">
                  {allOnTime ? "✓ On Time" : "⚠ Check"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            My Loans
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({myLoans.length})
            </span>
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLoanModal(true)}
              disabled={!isConnected}
              className="btn-primary px-5 py-2.5 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Loan
            </button>
            <button
              onClick={fetchMyLoans}
              disabled={!isConnected || loading}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* My Loans Section */}
        <div>
          {!isConnected ? (
            <div className="glass-card p-10 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
              <h3 className="text-xl font-bold mb-2 text-black">
                Connect Your Wallet
              </h3>
              <p className="text-gray-500 mb-6">
                Connect MetaMask to view your loans
              </p>
              <button onClick={connectWallet} className="btn-primary px-6 py-3">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
            </div>
          ) : loading ? (
            <div className="glass-card p-10 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-gray-400">Loading loans...</p>
            </div>
          ) : myLoans.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No loans yet</p>
              <p className="text-xs mt-1 text-gray-400">
                Click "Request Loan" to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myLoans.map((loan) => {
                const isFunded = loan.status === 1;
                const isRepaid = loan.status === 2;
                const isPending = loan.status === 0;
                const dueDate = loan.dueDate
                  ? new Date(loan.dueDate * 1000).toLocaleDateString()
                  : "N/A";
                const durationDays = Math.floor(loan.duration / (24 * 60 * 60));
                const totalRepayment = (
                  parseFloat(loan.amount) *
                  (1 + loan.interestRate / 100)
                ).toFixed(4);

                return (
                  <div
                    key={loan.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isRepaid
                              ? "bg-gray-100"
                              : isFunded
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          {isRepaid ? (
                            <CheckCircle className="w-5 h-5 text-gray-600" />
                          ) : isFunded ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-black">
                            {loan.amount} ETH
                          </div>
                          <div
                            className={`text-xs font-semibold ${
                              isRepaid
                                ? "text-gray-600"
                                : isFunded
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {loan.statusLabel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Loan #{loan.id}
                        </div>
                        {isFunded && (
                          <div className="text-xs font-semibold text-orange-600 mt-1">
                            Due: {dueDate}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Interest
                        </div>
                        <div className="text-sm font-bold text-black">
                          {loan.interestRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Duration
                        </div>
                        <div className="text-sm font-bold text-black">
                          {durationDays}d
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Repay
                        </div>
                        <div className="text-sm font-bold text-red-600">
                          {totalRepayment} ETH
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewLoanDetails(loan.id)}
                        className="flex-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View Details
                      </button>
                      {isFunded && (
                        <button
                          onClick={() => handleRepayLoan(loan.id)}
                          disabled={loading}
                          className="flex-1 text-xs text-white font-medium py-2 px-3 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Repay Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Loan Details</h3>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    STATUS
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedLoan.status === 2
                        ? "bg-gray-100 text-gray-600"
                        : selectedLoan.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedLoan.status === 2 ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : selectedLoan.status === 1 ? (
                      <Clock className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {selectedLoan.statusLabel}
                  </span>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    LOAN ID
                  </h4>
                  <p className="text-lg font-bold text-black">
                    #{selectedLoan.id}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    LOAN AMOUNT
                  </h4>
                  <p className="text-2xl font-bold text-black">
                    {selectedLoan.amount} ETH
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    INTEREST RATE
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedLoan.interestRate}%
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    DURATION
                  </h4>
                  <p className="text-2xl font-bold text-black">
                    {Math.floor(selectedLoan.duration / (24 * 60 * 60))} days
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    TOTAL REPAYMENT
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(
                      parseFloat(selectedLoan.amount) *
                      (1 + selectedLoan.interestRate / 100)
                    ).toFixed(4)}{" "}
                    ETH
                  </p>
                </div>
              </div>

              {/* Lender Information */}
              {selectedLoan.lender !==
                "0x0000000000000000000000000000000000000000" && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    LENDER INFORMATION
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Wallet Address:
                      </span>
                      <span className="text-sm font-mono text-black bg-gray-100 px-2 py-1 rounded">
                        {selectedLoan.lender.slice(0, 6)}...
                        {selectedLoan.lender.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Full Address:
                      </span>
                      <span className="text-xs font-mono text-gray-500 break-all">
                        {selectedLoan.lender}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  TIMELINE
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-semibold text-black">
                      {new Date(selectedLoan.createdAt * 1000).toLocaleString()}
                    </span>
                  </div>
                  {selectedLoan.dueDate > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm font-semibold text-black">
                        {new Date(selectedLoan.dueDate * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedLoan.status === 2 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Repaid Amount:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {selectedLoan.repaidAmount} ETH
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose */}
              {selectedLoan.purpose && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    PURPOSE
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedLoan.purpose}
                  </p>
                </div>
              )}

              {/* Risk Score */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  RISK ASSESSMENT
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Score:</span>
                  <span
                    className={`text-lg font-bold ${
                      selectedLoan.riskScore > 70
                        ? "text-red-600"
                        : selectedLoan.riskScore > 40
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedLoan.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {selectedLoan.status === 1 && (
                <button
                  onClick={() => {
                    setSelectedLoan(null);
                    handleRepayLoan(selectedLoan.id);
                  }}
                  className="btn-primary w-full py-3"
                >
                  Repay Loan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Request Loan</h3>
              <button
                onClick={() => setShowLoanModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Amount (ETH)
                </label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, amount: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter amount (e.g., 1.0)"
                  step="0.01"
                  min="0.01"
                />
                {loanForm.amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    Requesting:{" "}
                    <span className="font-bold">{loanForm.amount} ETH</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={loanForm.interestRate}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, interestRate: e.target.value })
                  }
                  className="input-field"
                  placeholder="10"
                  min="1"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={loanForm.duration}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, duration: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose (Optional)
                </label>
                <textarea
                  value={loanForm.purpose}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, purpose: e.target.value })
                  }
                  className="input-field"
                  rows="3"
                  placeholder="Brief description of loan purpose..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-900 mb-2 font-semibold">
                  Loan Summary
                </div>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">
                      {loanForm.amount || "0"} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold">
                      {loanForm.interestRate || "0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span className="font-semibold">0.5%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitLoan}
                disabled={loading || !loanForm.amount || !loanForm.interestRate}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerDashboard;
