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
  const navigate = useNavigate();

  const { account, connectWallet, contract, isConnected } = useWeb3();
  const { getBorrowerLoans, getLenderLoans, getReputation } = useLoan();

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

  // Auto-fetch loans when connected
  useEffect(() => {
    if (isConnected && account && contract) {
      fetchLoans();
    }
  }, [isConnected, account, contract]);

  const lendingTransactions = loans.filter((t) => t.type === "lend");
  const borrowingTransactions = loans.filter((t) => t.type === "borrow");

  const totalLent = lendingTransactions.reduce((sum, t) => {
    const amount = parseFloat(ethers.formatEther(t.amount || "0"));
    return sum + amount;
  }, 0);

  const totalBorrowed = borrowingTransactions.reduce((sum, t) => {
    const amount = parseFloat(ethers.formatEther(t.amount || "0"));
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
    <div className="min-h-screen bg-xbox-dark text-white">
      <nav className="bg-xbox-gray/60 backdrop-blur border-b border-xbox-green/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-xbox-green rounded-sm flex items-center justify-center glow-border">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
                Dashboard
              </p>
              <h1 className="text-2xl font-black glow-text">LOANX</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                className="bg-xbox-green hover:bg-xbox-green/80 text-white"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="text-right mr-4">
                  <p className="text-xs text-gray-400">Connected</p>
                  <p className="text-sm font-mono text-xbox-green">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>
                <Button
                  onClick={fetchLoans}
                  variant="outline"
                  className="border-xbox-green text-white hover:bg-xbox-green/10"
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
              className="border-xbox-green text-white hover:bg-xbox-green/10"
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
            <div className="text-4xl font-bold text-glow">
              {user ? `Welcome, ${user.name}` : "LOANX ARENA"}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Real-time Micro-Lending Intelligence • Ethereum-Secured Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Total Lent"
            value={`${totalLent.toFixed(4)} ETH`}
            hint={`${activeLends} active missions`}
            icon={<TrendingUp className="w-6 h-6 text-xbox-green/80" />}
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
            icon={<Shield className="w-6 h-6 text-xbox-green/80" />}
          />
        </div>

        {!isConnected ? (
          <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70 mb-6">
            <CardContent className="py-10 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-xbox-green/50" />
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Connect MetaMask to view your lending and borrowing history on
                the blockchain
              </p>
              <Button
                onClick={connectWallet}
                className="bg-xbox-green hover:bg-xbox-green/80 text-white"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-xbox-gray/70 border border-xbox-green/30 p-1 rounded-lg">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="lending">Lending Records</TabsTrigger>
              <TabsTrigger value="borrowing">Borrowing Records</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-xbox-green" />
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
                <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-xbox-green" />
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
                <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-xbox-green" />
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
    </div>
  );
};

const StatCard = ({ title, value, hint, icon, valueClass }) => (
  <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-gray-400 uppercase tracking-[0.3em]">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div
          className={`text-3xl font-black ${valueClass || "text-xbox-green"}`}
        >
          {value}
        </div>
        {icon}
      </div>
      <CardDescription className="mt-2">{hint}</CardDescription>
    </CardContent>
  </Card>
);

const EmptyState = ({ message }) => (
  <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
    <CardContent className="py-10 text-center text-gray-400">
      {message}
    </CardContent>
  </Card>
);

const TransactionCard = ({ transaction, onCopy, copiedKey }) => {
  const getRiskColor = (score) => {
    if (score < 30) return "bg-green-900/80 text-green-300";
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
        return "bg-green-900/80 text-green-300";
      case 2:
        return "bg-gray-900/80 text-gray-300";
      case 3:
        return "bg-red-900/80 text-red-300";
      default:
        return "bg-gray-900/80 text-gray-300";
    }
  };

  const amount = parseFloat(ethers.formatEther(transaction.amount || "0"));
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
    <Card className="xbox-glow-hover border-xbox-green/30 bg-xbox-gray/70 overflow-hidden">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center font-bold ${
                transaction.type === "lend"
                  ? "bg-green-900/30 text-green-300"
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
            <p className="font-mono text-sm font-bold text-xbox-green">
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
              className="flex items-center gap-2 text-xs text-xbox-green hover:text-xbox-green/80 transition"
            >
              <Copy
                className={`w-3 h-3 ${
                  copiedKey === loanId ? "text-green-400" : ""
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
