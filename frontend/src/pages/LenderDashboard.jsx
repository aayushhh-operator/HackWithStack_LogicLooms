import { ethers } from "ethers";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  RefreshCw,
  Shield,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../contexts/AuthContext";
import { useLoan } from "../hooks/useLoan";

const LenderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, connectWallet, isConnected, contract } = useWeb3();
  const { getLenderLoans, fundLoan, loading: loanLoading } = useLoan();

  const [riskFilter, setRiskFilter] = useState("all");
  const [myInvestments, setMyInvestments] = useState([]);
  const [availableLoans, setAvailableLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [riskExplanations, setRiskExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});

  // Fetch my investments (loans I've funded)
  const fetchMyInvestments = async () => {
    if (!account || !isConnected) return;

    setLoading(true);
    try {
      const loans = await getLenderLoans(account);
      // Sort by ID descending (most recent first)
      const sortedLoans = loans.sort((a, b) => Number(b.id) - Number(a.id));
      setMyInvestments(sortedLoans);
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available loans to fund
  const fetchAvailableLoans = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const totalLoans = await contract.getTotalLoans();
      const loans = [];

      for (let i = 1; i <= Number(totalLoans); i++) {
        try {
          const loan = await contract.getLoan(i);

          // Only show loans with status = Requested (0) that aren't from current user
          if (
            Number(loan[8]) === 0 &&
            loan[1].toLowerCase() !== account?.toLowerCase()
          ) {
            const riskScore = Number(loan[9]);
            const loanData = {
              id: loan[0].toString(),
              borrower: loan[1],
              amount: ethers.formatEther(loan[3]),
              amountWei: loan[3].toString(),
              interestRate: Number(loan[4]) / 100,
              duration: Number(loan[5]),
              riskScore: riskScore,
              risk: riskScore < 30 ? "low" : riskScore < 60 ? "medium" : "high",
              purpose: loan[11] || "No purpose specified",
            };
            loans.push(loanData);
          }
        } catch (err) {
          console.warn(`Failed to fetch loan ${i}:`, err);
        }
      }

      // Sort by ID descending (most recent first)
      const sortedLoans = loans.sort((a, b) => Number(b.id) - Number(a.id));
      setAvailableLoans(sortedLoans);
    } catch (error) {
      console.error("Error fetching available loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account && contract) {
      fetchMyInvestments();
      fetchAvailableLoans();
    }
  }, [isConnected, account, contract]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFundLoan = async (loan) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      const confirmed = confirm(
        `Fund loan ${loan.id} with ${loan.amount} ETH at ${loan.interestRate}% interest?`
      );

      if (confirmed) {
        await fundLoan(loan.id, loan.amountWei);
        alert("Loan funded successfully!");
        await fetchMyInvestments();
        await fetchAvailableLoans();
      }
    } catch (error) {
      console.error("Error funding loan:", error);
      alert(`Failed to fund loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvestmentDetails = (investmentId) => {
    const investment = myInvestments.find((inv) => inv.id === investmentId);
    if (investment) {
      setSelectedInvestment(investment);
    }
  };

  // Fetch AI risk explanation for a borrower
  const fetchRiskExplanation = async (loan) => {
    const loanId = loan.id;

    // Don't re-fetch if already loaded
    if (riskExplanations[loanId]) return;

    setLoadingExplanations((prev) => ({ ...prev, [loanId]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/borrower-risk-explanation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            borrowerAddress: loan.borrower,
            age: 30, // Default values - ideally fetch from borrower profile
            income: 50000,
            employmentLength: 5,
            amount: parseFloat(loan.amount) * 1000, // Convert ETH to approx USD
            rate: loan.interestRate,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRiskExplanations((prev) => ({
          ...prev,
          [loanId]: data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch risk explanation:", error);
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [loanId]: false }));
    }
  };

  const filteredLoans =
    riskFilter === "all"
      ? availableLoans
      : availableLoans.filter((loan) => loan.risk === riskFilter);

  // Calculate stats from blockchain data
  const totalInvested = myInvestments.reduce((sum, inv) => {
    return sum + parseFloat(inv.amount || 0);
  }, 0);

  const activeInvestments = myInvestments.filter(
    (inv) => inv.status === 1
  ).length;
  const totalEarnings = myInvestments.reduce((sum, inv) => {
    if (inv.status === 2) {
      // Repaid
      return sum + parseFloat(inv.amount || 0) * (inv.interestRate / 100);
    }
    return sum;
  }, 0);

  const getRiskBadge = (risk) => {
    const styles = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[risk] || styles.low;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">
                Lender Dashboard
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
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Total Invested</div>
                <div className="text-lg font-bold text-black">
                  {totalInvested.toFixed(4)} ETH
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Total Earnings</div>
                <div className="text-lg font-bold text-green-600">
                  {totalEarnings.toFixed(4)} ETH
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Active Loans</div>
                <div className="text-lg font-bold text-black">
                  {activeInvestments}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Opportunities</div>
                <div className="text-lg font-bold text-black">
                  {availableLoans.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Investments */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                My Investments
              </h2>
              <button
                onClick={fetchMyInvestments}
                disabled={!isConnected || loading}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
            {!isConnected ? (
              <div className="glass-card p-10 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
                <h3 className="text-xl font-bold mb-2 text-black">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-500 mb-6">
                  Connect MetaMask to view your investments
                </p>
                <button
                  onClick={connectWallet}
                  className="btn-primary px-6 py-3"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </button>
              </div>
            ) : loading ? (
              <div className="glass-card p-10 text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-gray-400">Loading investments...</p>
              </div>
            ) : myInvestments.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No investments yet</p>
                <p className="text-xs mt-1">
                  Browse opportunities to start investing!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {myInvestments.map((investment) => {
                  const dueDate = investment.dueDate
                    ? new Date(investment.dueDate * 1000).toLocaleDateString()
                    : "N/A";
                  const isRepaid = investment.status === 2;
                  const progress = isRepaid ? 100 : 50;
                  const borrowerShort = `${investment.borrower.slice(
                    0,
                    6
                  )}...${investment.borrower.slice(-4)}`;
                  const expectedReturn = (
                    parseFloat(investment.amount) *
                    (investment.interestRate / 100)
                  ).toFixed(4);

                  return (
                    <div
                      key={investment.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isRepaid ? "bg-gray-100" : "bg-green-100"
                            }`}
                          >
                            <CheckCircle
                              className={`w-5 h-5 ${
                                isRepaid ? "text-gray-600" : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-black">
                              {investment.amount} ETH
                            </div>
                            <div className="text-xs text-gray-500">
                              {borrowerShort}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            +{expectedReturn} ETH
                          </div>
                          <div className="text-xs text-gray-500">
                            {investment.interestRate}% APY
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{investment.statusLabel}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isRepaid ? "bg-gray-600" : "bg-blue-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {dueDate}
                        </div>
                        <button
                          onClick={() =>
                            handleViewInvestmentDetails(investment.id)
                          }
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Loan Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Available Opportunities
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredLoans.length})
                </span>
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risks</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <button
                  onClick={fetchAvailableLoans}
                  disabled={!isConnected || loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {!isConnected ? (
              <div className="glass-card p-10 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
                <h3 className="text-xl font-bold mb-2 text-black">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-500 mb-6">
                  Connect MetaMask to view available loans
                </p>
                <button
                  onClick={connectWallet}
                  className="btn-primary px-6 py-3"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </button>
              </div>
            ) : loading ? (
              <div className="glass-card p-10 text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-gray-400">Loading available loans...</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No loans matching your criteria</p>
                <p className="text-xs mt-1">Try adjusting the risk filter</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredLoans.map((loan) => {
                  const durationDays = Math.floor(
                    loan.duration / (24 * 60 * 60)
                  );
                  const borrowerShort = `${loan.borrower.slice(
                    0,
                    6
                  )}...${loan.borrower.slice(-4)}`;
                  const expectedReturn = (
                    parseFloat(loan.amount) *
                    (loan.interestRate / 100)
                  ).toFixed(4);

                  return (
                    <div
                      key={loan.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="text-2xl font-bold text-black">
                              {loan.amount} ETH
                            </div>
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-full border-2 ${getRiskBadge(
                                loan.risk
                              )}`}
                            >
                              {loan.risk.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {borrowerShort}
                          </div>
                        </div>
                        <div className="text-right bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {loan.interestRate}%
                          </div>
                          <div className="text-xs text-green-700">
                            +{expectedReturn} ETH
                          </div>
                        </div>
                      </div>

                      {/* Loan Details Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Duration
                          </div>
                          <div className="text-sm font-bold text-black">
                            {durationDays} days
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            Risk Score
                          </div>
                          <div className="text-sm font-bold text-black">
                            {loan.riskScore}/100
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Purpose
                          </div>
                          <div className="text-sm font-bold text-black truncate">
                            {loan.purpose}
                          </div>
                        </div>
                      </div>

                      {/* AI Explanation Section */}
                      {riskExplanations[loan.id] ? (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-2 mb-3">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-black mb-1">
                                AI Risk Analysis
                              </h4>
                              {riskExplanations[loan.id].ai_explanation && (
                                <p className="text-sm text-gray-700 mb-3">
                                  {riskExplanations[loan.id].ai_explanation}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Feature Importance */}
                          {riskExplanations[loan.id].feature_importance && (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-gray-600 mb-2">
                                Key Risk Factors:
                              </div>
                              {riskExplanations[loan.id].feature_importance
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          feature.direction === "positive"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                      ></div>
                                      <span className="font-medium text-gray-700">
                                        {feature.feature}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-600">
                                        {feature.value.toLocaleString()}
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          feature.direction === "positive"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {feature.impact_percent}% impact
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Recommendation Badge */}
                          {riskExplanations[loan.id].recommendation && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${
                                  riskExplanations[loan.id].recommendation ===
                                  "Recommended"
                                    ? "bg-green-100 text-green-700"
                                    : riskExplanations[loan.id]
                                        .recommendation === "Caution Advised"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {riskExplanations[loan.id].recommendation}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => fetchRiskExplanation(loan)}
                          disabled={loadingExplanations[loan.id]}
                          className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Shield className="w-4 h-4" />
                          <span>
                            {loadingExplanations[loan.id]
                              ? "Loading AI Analysis..."
                              : "View AI Risk Analysis"}
                          </span>
                        </button>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                          Risk Assessment:{" "}
                          {loan.risk === "low"
                            ? "Low risk"
                            : loan.risk === "medium"
                            ? "Medium risk"
                            : "High risk"}
                        </div>
                        <button
                          onClick={() => handleFundLoan(loan)}
                          disabled={loading}
                          className="btn-primary px-6 py-2 disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Fund Loan"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Details Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                Investment Details
              </h3>
              <button
                onClick={() => setSelectedInvestment(null)}
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
                      selectedInvestment.status === 2
                        ? "bg-green-100 text-green-700"
                        : selectedInvestment.status === 1
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedInvestment.status === 2 ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : selectedInvestment.status === 1 ? (
                      <Clock className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {selectedInvestment.statusLabel}
                  </span>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    LOAN ID
                  </h4>
                  <p className="text-lg font-bold text-black">
                    #{selectedInvestment.id}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    INVESTED AMOUNT
                  </h4>
                  <p className="text-2xl font-bold text-black">
                    {selectedInvestment.amount} ETH
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    INTEREST RATE
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedInvestment.interestRate}%
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    EXPECTED RETURN
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(
                      parseFloat(selectedInvestment.amount) *
                      (selectedInvestment.interestRate / 100)
                    ).toFixed(4)}{" "}
                    ETH
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    TOTAL RETURN
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(
                      parseFloat(selectedInvestment.amount) *
                      (1 + selectedInvestment.interestRate / 100)
                    ).toFixed(4)}{" "}
                    ETH
                  </p>
                </div>
              </div>

              {/* Borrower Information */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  BORROWER INFORMATION
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Wallet Address:
                    </span>
                    <span className="text-sm font-mono text-black bg-gray-100 px-2 py-1 rounded">
                      {selectedInvestment.borrower.slice(0, 6)}...
                      {selectedInvestment.borrower.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Full Address:</span>
                    <span className="text-xs font-mono text-gray-500 break-all">
                      {selectedInvestment.borrower}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Score:</span>
                    <span
                      className={`text-sm font-bold ${
                        selectedInvestment.riskScore > 70
                          ? "text-red-600"
                          : selectedInvestment.riskScore > 40
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedInvestment.riskScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  TIMELINE
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Loan Created:</span>
                    <span className="text-sm font-semibold text-black">
                      {new Date(
                        selectedInvestment.createdAt * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Funded Date:</span>
                    <span className="text-sm font-semibold text-black">
                      {new Date(
                        selectedInvestment.createdAt * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                  {selectedInvestment.dueDate > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm font-semibold text-black">
                        {new Date(
                          selectedInvestment.dueDate * 1000
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedInvestment.dueDate > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Days Remaining:
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          Math.floor(
                            (selectedInvestment.dueDate * 1000 - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          ) < 7
                            ? "text-red-600"
                            : "text-black"
                        }`}
                      >
                        {Math.max(
                          0,
                          Math.floor(
                            (selectedInvestment.dueDate * 1000 - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}{" "}
                        days
                      </span>
                    </div>
                  )}
                  {selectedInvestment.status === 2 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Repaid Amount:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {selectedInvestment.repaidAmount} ETH
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan Duration */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  LOAN DURATION
                </h4>
                <p className="text-2xl font-bold text-black">
                  {Math.floor(selectedInvestment.duration / (24 * 60 * 60))}{" "}
                  days
                </p>
              </div>

              {/* Purpose */}
              {selectedInvestment.purpose && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    LOAN PURPOSE
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedInvestment.purpose}
                  </p>
                </div>
              )}

              {/* Performance Indicator */}
              {selectedInvestment.status === 2 && (
                <div className="glass-card p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-1">
                        INVESTMENT COMPLETED
                      </h4>
                      <p className="text-xs text-green-600">
                        This loan has been fully repaid
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}
              {selectedInvestment.status === 1 &&
                selectedInvestment.dueDate > 0 && (
                  <div
                    className={`glass-card p-4 ${
                      Math.floor(
                        (selectedInvestment.dueDate * 1000 - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      ) < 7
                        ? "bg-red-50"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className={`text-sm font-semibold mb-1 ${
                            Math.floor(
                              (selectedInvestment.dueDate * 1000 - Date.now()) /
                                (1000 * 60 * 60 * 24)
                            ) < 7
                              ? "text-red-700"
                              : "text-blue-700"
                          }`}
                        >
                          {Math.floor(
                            (selectedInvestment.dueDate * 1000 - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          ) < 7
                            ? "DUE SOON"
                            : "ACTIVE INVESTMENT"}
                        </h4>
                        <p
                          className={`text-xs ${
                            Math.floor(
                              (selectedInvestment.dueDate * 1000 - Date.now()) /
                                (1000 * 60 * 60 * 24)
                            ) < 7
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {Math.floor(
                            (selectedInvestment.dueDate * 1000 - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          ) < 7
                            ? "Payment due within 7 days"
                            : "Waiting for borrower repayment"}
                        </p>
                      </div>
                      <Clock
                        className={`w-8 h-8 ${
                          Math.floor(
                            (selectedInvestment.dueDate * 1000 - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          ) < 7
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderDashboard;
