import { ethers } from "ethers";
import {
  AlertCircle,
  Copy,
  LogOut,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useWeb3 } from "../context/Web3Context";
import { useLoan } from "../hooks/useLoan";

const Dashboard = () => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reputation, setReputation] = useState(0);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showLendingModal, setShowLendingModal] = useState(false);
  const [availableLoans, setAvailableLoans] = useState([]);
  const [loanFormData, setLoanFormData] = useState({
    amount: "",
    interestRate: "",
    duration: "",
    purpose: "",
  });
  const navigate = useNavigate();

  const { account, connectWallet, contract, isConnected } = useWeb3();
  const {
    getBorrowerLoans,
    getLenderLoans,
    getReputation,
    requestLoan,
    fundLoan,
  } = useLoan();

  // Chart data for financial overview
  const chartData = [
    { month: "Sept 1", lent: 0, borrowed: 0 },
    { month: "Sept 8", lent: 0, borrowed: 0 },
    { month: "Sept 15", lent: 0, borrowed: 0 },
    { month: "Sept 22", lent: 0, borrowed: 0 },
    { month: "Sept 29", lent: 0, borrowed: 0 },
    { month: "Oct 6", lent: 0, borrowed: 0 },
    { month: "Oct 13", lent: 0, borrowed: 0 },
    { month: "Oct 20", lent: 0, borrowed: 0 },
    { month: "Oct 27", lent: 0, borrowed: 0 },
    { month: "Nov 3", lent: 0, borrowed: 0 },
    { month: "Nov 10", lent: 0, borrowed: 0 },
    { month: "Nov 19", lent: 0, borrowed: 0 },
  ];

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("logiclooms:user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("logiclooms:user");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch loans from blockchain
  const fetchLoans = async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      const borrowerLoans = await getBorrowerLoans(account);
      const lenderLoans = await getLenderLoans(account);
      const userReputation = await getReputation(account);

      // Combine and format loans
      const allLoans = [
        ...borrowerLoans.map((loan) => ({ ...loan, type: "borrow" })),
        ...lenderLoans.map((loan) => ({ ...loan, type: "lend" })),
      ];

      setLoans(allLoans);
      setReputation(userReputation);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available loans for lending (all loans with status = Requested)
  const fetchAvailableLoans = async () => {
    if (!contract) return;

    try {
      const totalLoans = await contract.getTotalLoans();
      console.log(
        "🚀 NEW CODE LOADED! Total loans in contract:",
        Number(totalLoans)
      );
      const loans = [];

      // Fetch all loans from contract
      for (let i = 1; i <= Number(totalLoans); i++) {
        try {
          const loan = await contract.getLoan(i);
          console.log(`Loan ${i} RAW DATA:`, {
            id: loan[0].toString(),
            borrower: loan[1],
            lender: loan[2],
            amount: loan[3].toString(),
            interestRate: loan[4].toString(),
            duration: loan[5].toString(),
            dueDate: loan[6].toString(),
            repaidAmount: loan[7].toString(),
            statusRaw: loan[8].toString(), // FIXED: Status is at index 8!
            statusNumber: Number(loan[8]),
            riskScore: loan[9].toString(), // FIXED: Risk score is at index 9!
            createdAt: loan[10].toString(),
            purpose: loan[11],
          });
          console.log(`Loan ${i}:`, {
            status: Number(loan[8]), // FIXED: Correct index
            borrower: loan[1],
            currentUser: account,
            isOwnLoan: loan[1].toLowerCase() === account?.toLowerCase(),
          });

          // Only show loans with status = Requested (0) that aren't from current user
          if (
            Number(loan[8]) === 0 &&
            loan[1].toLowerCase() !== account?.toLowerCase()
          ) {
            const loanData = {
              id: loan[0].toString(),
              borrower: loan[1],
              lender: loan[2],
              amount: loan[3].toString(), // Keep as wei for funding
              interestRate: Number(loan[4]),
              duration: Number(loan[5]),
              dueDate: Number(loan[6]),
              repaidAmount: loan[7].toString(),
              status: Number(loan[8]), // FIXED: Correct index
              riskScore: Number(loan[9]), // FIXED: Correct index
              createdAt: Number(loan[10]),
              purpose: loan[11],
            };
            console.log("Adding loan to available loans:", loanData);
            loans.push(loanData);
          }
        } catch (err) {
          console.warn(`Failed to fetch loan ${i}:`, err);
        }
      }

      console.log("Available loans found:", loans.length, loans);
      setAvailableLoans(loans);
    } catch (error) {
      console.error("Error fetching available loans:", error);
    }
  };

  // Auto-fetch loans when connected
  useEffect(() => {
    if (isConnected && account && contract) {
      fetchLoans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, account, contract]);

  const lendingTransactions = loans.filter((t) => t.type === "lend");
  const borrowingTransactions = loans.filter((t) => t.type === "borrow");

  const totalLent = lendingTransactions.reduce((sum, t) => {
    // t.amount is already formatted as Ether string from getLoan()
    const amount = parseFloat(t.amount || "0");
    return sum + amount;
  }, 0);

  const totalBorrowed = borrowingTransactions.reduce((sum, t) => {
    // t.amount is already formatted as Ether string from getLoan()
    const amount = parseFloat(t.amount || "0");
    return sum + amount;
  }, 0);

  const activeLends = lendingTransactions.filter((t) => t.status === 1).length; // Status 1 = Funded
  const activeBorrows = borrowingTransactions.filter(
    (t) => t.status === 1
  ).length;

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("logiclooms:user");
    localStorage.removeItem("logiclooms:token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Dashboard
              </p>
              <h1 className="text-2xl font-bold text-black">LOANX</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                className="btn-primary"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="text-right mr-4">
                  <p className="text-xs text-gray-500">Connected</p>
                  <p className="text-sm font-mono text-blue-600">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>
                <Button
                  onClick={fetchLoans}
                  variant="outline"
                  className="btn-outline"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className="btn-outline"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-black">
              {user ? `Welcome, ${user.name}` : "LOANX ARENA"}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Real-time Micro-Lending Intelligence • Ethereum-Secured Dashboard
          </p>
        </div>

        {/* New layout with buttons and chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
          {/* Buttons - col 1 */}
          <div className="flex flex-col gap-4 justify-center lg:col-span-1 min-h-[250px]">
            <Button
              onClick={() => setShowBorrowModal(true)}
              disabled={!isConnected}
              className="btn-primary text-lg px-8 py-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Loan
            </Button>
            <Button
              onClick={async () => {
                setShowLendingModal(true);
                await fetchAvailableLoans();
              }}
              disabled={!isConnected}
              className="btn-outline text-lg px-8 py-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Browse Loans
            </Button>
          </div>

          {/* Graph - col 2&3 (span 2 with more width) */}
          <div className="lg:col-span-2 min-h-[280px] flex items-center">
            <Card className="glass-card w-full h-full flex flex-col justify-center">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-black">Financial Overview</CardTitle>
                <CardDescription className="text-gray-500">
                  Lending vs Borrowing Trends (Live Data)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorLent"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4169E1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4169E1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorBorrowed"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 14, fill: '#1F2937', fontWeight: 500 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 14, fill: '#1F2937', fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "2px solid #E5E7EB",
                        borderRadius: "8px",
                        color: "#111827",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                      formatter={(value) => `${Number(value).toFixed(2)} ETH`}
                      labelStyle={{ color: "#111827", fontWeight: 600 }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      verticalAlign="top"
                      height={36}
                    />
                    <Area
                      type="monotone"
                      dataKey="lent"
                      stroke="#4169E1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorLent)"
                      name="Amount Lent"
                      dot={{ fill: "#4169E1cc", r: 4 }}
                      activeDot={{ r: 6, fill: "#4169E1" }}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                    <Area
                      type="monotone"
                      dataKey="borrowed"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBorrowed)"
                      name="Amount Borrowed"
                      dot={{ fill: "#3b82f6cc", r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stat cards row - full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Total Lent"
            value={`${totalLent.toFixed(4)} ETH`}
            hint={`${activeLends} active missions`}
            icon={<TrendingUp className="w-6 h-6 text-blue-600/80" />}
          />
          <StatCard
            title="Total Borrowed"
            value={`${totalBorrowed.toFixed(4)} ETH`}
            hint={`${activeBorrows} active credits`}
            icon={<TrendingDown className="w-6 h-6 text-red-400/80" />}
          />
          <StatCard
            title="Portfolio Risk"
            value={isConnected ? "Live" : "N/A"}
            hint={isConnected ? "Blockchain verified" : "Connect wallet"}
            valueClass="text-yellow-300"
            icon={<AlertCircle className="w-6 h-6 text-yellow-300/80" />}
          />
          <StatCard
            title="Reputation Score"
            value={isConnected ? reputation.toString() : "0"}
            hint={isConnected ? "Ethereum verified" : "Connect wallet"}
            icon={<Shield className="w-6 h-6 text-blue-600/80" />}
          />
        </div>

        {!isConnected ? (
          <Card className="glass-card mb-6">
            <CardContent className="py-10 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
              <h3 className="text-xl font-bold mb-2 text-black">Connect Your Wallet</h3>
              <p className="text-gray-500 mb-6">
                Connect MetaMask to view your lending and borrowing history on
                the blockchain
              </p>
              <Button
                onClick={connectWallet}
                className="btn-primary"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/70 border border-blue-600/30 p-1 rounded-lg">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="lending">Lending Records</TabsTrigger>
              <TabsTrigger value="borrowing">Borrowing Records</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <Card className="glass-card border-blue-600/30 bg-white/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p className="text-gray-400">Loading transactions...</p>
                  </CardContent>
                </Card>
              ) : loans.length === 0 ? (
                <EmptyState message="No transactions found. Start by requesting or funding a loan!" />
              ) : (
                loans.map((tx, index) => (
                  <TransactionCard
                    key={`${tx.loanId}-${index}`}
                    transaction={tx}
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="lending" className="space-y-4">
              {loading ? (
                <Card className="glass-card border-blue-600/30 bg-white/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p className="text-gray-400">Loading transactions...</p>
                  </CardContent>
                </Card>
              ) : lendingTransactions.length === 0 ? (
                <EmptyState message="No lending records found" />
              ) : (
                lendingTransactions.map((tx, index) => (
                  <TransactionCard
                    key={`lend-${tx.loanId}-${index}`}
                    transaction={tx}
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="borrowing" className="space-y-4">
              {loading ? (
                <Card className="glass-card border-blue-600/30 bg-white/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p className="text-gray-400">Loading transactions...</p>
                  </CardContent>
                </Card>
              ) : borrowingTransactions.length === 0 ? (
                <EmptyState message="No borrowing records found" />
              ) : (
                borrowingTransactions.map((tx, index) => (
                  <TransactionCard
                    key={`borrow-${tx.loanId}-${index}`}
                    transaction={tx}
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Loan Request Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="glass-card border-blue-600/50 bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white border-b border-blue-600/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">REQUEST LOAN</CardTitle>
                <CardDescription className="mt-1">
                  Enter the details for your loan request
                </CardDescription>
              </div>
              <button
                onClick={() => setShowBorrowModal(false)}
                className="p-1 hover:bg-blue-600/20 rounded transition-colors text-3xl"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  value={loanFormData.amount}
                  onChange={(e) =>
                    setLoanFormData({ ...loanFormData, amount: e.target.value })
                  }
                  placeholder="Enter amount to borrow"
                  className="w-full px-4 py-3 bg-gray-50 border border-blue-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={loanFormData.interestRate}
                  onChange={(e) =>
                    setLoanFormData({
                      ...loanFormData,
                      interestRate: e.target.value,
                    })
                  }
                  placeholder="Enter interest rate"
                  className="w-full px-4 py-3 bg-gray-50 border border-blue-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={loanFormData.duration}
                  onChange={(e) =>
                    setLoanFormData({
                      ...loanFormData,
                      duration: e.target.value,
                    })
                  }
                  placeholder="Enter loan duration"
                  className="w-full px-4 py-3 bg-gray-50 border border-blue-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Purpose
                </label>
                <textarea
                  value={loanFormData.purpose}
                  onChange={(e) =>
                    setLoanFormData({
                      ...loanFormData,
                      purpose: e.target.value,
                    })
                  }
                  placeholder="Why do you need this loan?"
                  className="w-full px-4 py-3 bg-gray-50 border border-blue-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowBorrowModal(false)}
                  variant="outline"
                  className="flex-1 border-blue-600/30 text-white hover:bg-blue-600/10"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await requestLoan(
                        loanFormData.amount,
                        loanFormData.interestRate,
                        loanFormData.duration,
                        loanFormData.purpose
                      );
                      setShowBorrowModal(false);
                      setLoanFormData({
                        amount: "",
                        interestRate: "",
                        duration: "",
                        purpose: "",
                      });
                      await fetchLoans();
                    } catch (error) {
                      console.error("Error requesting loan:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={
                    loading ||
                    !loanFormData.amount ||
                    !loanFormData.interestRate ||
                    !loanFormData.duration
                  }
                  className="flex-1 glass-card bg-gradient-to-r from-blue-600 to-blue-600/80 hover:from-blue-600/90 hover:to-blue-600 text-white font-bold uppercase tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "PROCESSING..." : "REQUEST LOAN"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lending Modal (Browse Loans) */}
      {showLendingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="glass-card border-blue-600/50 bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white border-b border-blue-600/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">AVAILABLE LOANS</CardTitle>
                <CardDescription className="mt-1">
                  Browse and fund loan requests from borrowers
                </CardDescription>
              </div>
              <button
                onClick={() => setShowLendingModal(false)}
                className="p-1 hover:bg-blue-600/20 rounded transition-colors text-3xl"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              {availableLoans.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
                  <p className="text-lg font-semibold mb-2">
                    No Available Loans
                  </p>
                  <p className="text-sm">
                    Check back later for new loan requests from other borrowers
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableLoans.map((loan, index) => {
                    const amountInEth = ethers.formatEther(loan.amount);
                    return (
                      <Card
                        key={`loan-${loan.id}-${index}`}
                        className="border-blue-600/30 bg-gray-50"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm text-gray-400">
                                Loan #{loan.id}
                              </p>
                              <p className="text-2xl font-bold text-blue-600">
                                {amountInEth} ETH
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Borrower: {loan.borrower.slice(0, 6)}...
                                {loan.borrower.slice(-4)}
                              </p>
                            </div>
                            <Badge className="bg-blue-900/50 text-blue-300 border-blue-400/50">
                              REQUESTED
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-gray-400">Interest Rate</p>
                              <p className="text-white font-semibold">
                                {loan.interestRate / 100}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Risk Score</p>
                              <p
                                className={`font-semibold ${
                                  loan.riskScore < 30
                                    ? "text-blue-400"
                                    : loan.riskScore < 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {loan.riskScore}{" "}
                                {loan.riskScore < 30
                                  ? "(Low)"
                                  : loan.riskScore < 60
                                  ? "(Medium)"
                                  : "(High)"}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-4">
                            <span className="text-gray-500">Purpose:</span>{" "}
                            {loan.purpose || "No purpose specified"}
                          </p>
                          <Button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                console.log("Funding loan:", {
                                  loanId: loan.id,
                                  amount: loan.amount,
                                });
                                await fundLoan(loan.id, loan.amount);
                                setShowLendingModal(false);
                                await fetchLoans(); // Refresh to show updated status
                              } catch (error) {
                                console.error("Error funding loan:", error);
                                alert(
                                  `Failed to fund loan: ${
                                    error.message || "Unknown error"
                                  }`
                                );
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading || loan.borrower === account}
                            className="w-full bg-blue-600 hover:bg-blue-600/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading
                              ? "Processing..."
                              : loan.borrower === account
                              ? "Cannot fund own loan"
                              : `Fund ${amountInEth} ETH`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, hint, icon, valueClass }) => (
  <Card className="stat-card">
    <CardHeader className="pb-2">
      <CardTitle className="stat-label">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div
          className={`stat-value ${valueClass || ""}`}
        >
          {value}
        </div>
        {icon}
      </div>
      <CardDescription className="mt-2 text-gray-500">{hint}</CardDescription>
    </CardContent>
  </Card>
);

const EmptyState = ({ message }) => (
  <Card className="glass-card">
    <CardContent className="py-10 text-center text-gray-500">
      {message}
    </CardContent>
  </Card>
);

const TransactionCard = ({ transaction, onCopy, copiedKey }) => {
  const getRiskColor = (score) => {
    if (score < 30) return "bg-blue-900/80 text-blue-300";
    if (score < 60) return "bg-yellow-900/80 text-yellow-300";
    return "bg-red-900/80 text-red-300";
  };

  const getRiskLabel = (score) => {
    if (score < 30) return "LOW";
    if (score < 60) return "MEDIUM";
    return "HIGH";
  };

  const getStatusLabel = (status) => {
    const statuses = ["Requested", "Funded", "Repaid", "Defaulted"];
    return statuses[status] || "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "bg-blue-900/80 text-blue-300";
      case 1:
        return "bg-blue-900/80 text-blue-300";
      case 2:
        return "bg-gray-900/80 text-gray-300";
      case 3:
        return "bg-red-900/80 text-red-300";
      default:
        return "bg-gray-900/80 text-gray-300";
    }
  };

  // transaction.amount is already formatted as Ether string from getLoan()
  const amount = parseFloat(transaction.amount || "0");
  const interestRate = transaction.interestRate
    ? Number(transaction.interestRate) / 100
    : 0;
  const riskScore = transaction.riskScore ? Number(transaction.riskScore) : 0;
  const borrowerAddress = transaction.borrower || "Unknown";
  const lenderAddress = transaction.lender || "Not funded yet";
  const displayAddress =
    transaction.type === "lend" ? borrowerAddress : lenderAddress;
  const loanId =
    transaction.loanId !== undefined ? transaction.loanId.toString() : "N/A";

  return (
    <Card className="glass-card border-blue-600/30 bg-white/70 overflow-hidden">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center font-bold ${
                transaction.type === "lend"
                  ? "bg-blue-900/30 text-blue-300"
                  : "bg-red-900/30 text-red-300"
              }`}
            >
              {transaction.type === "lend" ? "→" : "←"}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {transaction.type === "lend" ? "Lending" : "Borrowing"}
              </p>
              <p className="text-2xl font-bold">{amount.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500 mt-1">Loan ID: #{loanId}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {transaction.type === "lend" ? "Borrower" : "Lender"}
            </p>
            <p className="font-mono text-sm font-bold text-blue-600">
              {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
            </p>
            <p className="text-xs text-gray-500 mt-1">On-chain identity</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Interest & Status
            </p>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-lg font-bold text-white">{interestRate}%</p>
            </div>
            <Badge
              className={`${getStatusColor(
                transaction.status
              )} border-0 uppercase tracking-wider`}
            >
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Risk Score
            </p>
            <div
              className={`inline-flex px-3 py-2 rounded font-bold text-sm ${getRiskColor(
                riskScore
              )}`}
            >
              {riskScore} • {getRiskLabel(riskScore)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {riskScore < 30
                ? "✓ Safe corridor"
                : riskScore < 60
                ? "⚠ Tactical caution"
                : "✗ High volatility"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Purpose
            </p>
            <p className="text-sm text-white mb-2">
              {transaction.purpose || "Not specified"}
            </p>
            <button
              onClick={() => onCopy(displayAddress, loanId)}
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-600/80 transition"
            >
              <Copy
                className={`w-3 h-3 ${
                  copiedKey === loanId ? "text-blue-400" : ""
                }`}
              />
              {copiedKey === loanId ? "Copied!" : "Copy address"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;

