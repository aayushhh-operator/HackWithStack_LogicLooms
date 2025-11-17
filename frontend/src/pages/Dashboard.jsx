import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertCircle,
  Zap,
  LogOut,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

const mockTransactions = [
  {
    id: 'TX001',
    type: 'lend',
    amount: 5000,
    counterparty: 'Player_Alpha',
    publicKey: '0x742d...f3b2',
    riskScore: 28,
    status: 'active',
    date: '2025-11-15',
    dueDate: '2025-12-15',
  },
  {
    id: 'TX002',
    type: 'borrow',
    amount: 3500,
    counterparty: 'LenderX_99',
    publicKey: '0x8f1c...a2e5',
    riskScore: 62,
    status: 'active',
    date: '2025-11-10',
    dueDate: '2025-11-25',
  },
  {
    id: 'TX003',
    type: 'lend',
    amount: 8200,
    counterparty: 'CryptoVault',
    publicKey: '0x5a3e...b8c1',
    riskScore: 15,
    status: 'completed',
    date: '2025-10-20',
    dueDate: '2025-11-20',
  },
  {
    id: 'TX004',
    type: 'borrow',
    amount: 2100,
    counterparty: 'FastLoan_7',
    publicKey: '0x9d2f...c4e7',
    riskScore: 78,
    status: 'defaulted',
    date: '2025-09-15',
    dueDate: '2025-10-15',
  },
  {
    id: 'TX005',
    type: 'lend',
    amount: 6800,
    counterparty: 'TrustWallet_Pro',
    publicKey: '0x4b6c...e9f2',
    riskScore: 35,
    status: 'active',
    date: '2025-11-12',
    dueDate: '2025-12-12',
  },
]

const Dashboard = () => {
  const [copiedKey, setCopiedKey] = useState(null)
  const navigate = useNavigate()

  const lendingTransactions = mockTransactions.filter((t) => t.type === 'lend')
  const borrowingTransactions = mockTransactions.filter((t) => t.type === 'borrow')
  const totalLent = lendingTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalBorrowed = borrowingTransactions.reduce((sum, t) => sum + t.amount, 0)
  const activeLends = lendingTransactions.filter((t) => t.status === 'active').length
  const activeBorrows = borrowingTransactions.filter((t) => t.status === 'active').length

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-xbox-dark text-white">
      <nav className="bg-xbox-gray/60 backdrop-blur border-b border-xbox-green/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-xbox-green rounded-sm flex items-center justify-center glow-border">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">Dashboard</p>
              <h1 className="text-2xl font-black glow-text">LOANX</h1>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-xbox-green text-white hover:bg-xbox-green/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-glow">LOANX ARENA</div>
          </div>
          <p className="text-sm text-gray-400">
            Real-time Micro-Lending Intelligence • Ethereum-Secured Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Total Lent"
            value={`${totalLent.toLocaleString()} ETH`}
            hint={`${activeLends} active missions`}
            icon={<TrendingUp className="w-6 h-6 text-xbox-green/80" />}
          />
          <StatCard
            title="Total Borrowed"
            value={`${totalBorrowed.toLocaleString()} ETH`}
            hint={`${activeBorrows} active credits`}
            icon={<TrendingDown className="w-6 h-6 text-red-400/80" />}
          />
          <StatCard
            title="Portfolio Risk"
            value="42"
            hint="Moderate health"
            valueClass="text-yellow-300"
            icon={<AlertCircle className="w-6 h-6 text-yellow-300/80" />}
          />
          <StatCard
            title="Trust Score"
            value="8.7/10"
            hint="Ethereum verified"
            icon={<Shield className="w-6 h-6 text-xbox-green/80" />}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-xbox-gray/70 border border-xbox-green/30 p-1 rounded-lg">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="lending">Lending Records</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing Records</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                copiedKey={copiedKey}
                onCopy={copyToClipboard}
              />
            ))}
          </TabsContent>

          <TabsContent value="lending" className="space-y-4">
            {lendingTransactions.length === 0 ? (
              <EmptyState message="No lending records found" />
            ) : (
              lendingTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  copiedKey={copiedKey}
                  onCopy={copyToClipboard}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="borrowing" className="space-y-4">
            {borrowingTransactions.length === 0 ? (
              <EmptyState message="No borrowing records found" />
            ) : (
              borrowingTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  copiedKey={copiedKey}
                  onCopy={copyToClipboard}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, hint, icon, valueClass }) => (
  <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-gray-400 uppercase tracking-[0.3em]">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className={`text-3xl font-black ${valueClass || 'text-xbox-green'}`}>
          {value}
        </div>
        {icon}
      </div>
      <CardDescription className="mt-2">{hint}</CardDescription>
    </CardContent>
  </Card>
)

const EmptyState = ({ message }) => (
  <Card className="xbox-glow border-xbox-green/30 bg-xbox-gray/70">
    <CardContent className="py-10 text-center text-gray-400">{message}</CardContent>
  </Card>
)

const TransactionCard = ({ transaction, onCopy, copiedKey }) => {
  const getRiskColor = (score) => {
    if (score < 30) return 'bg-green-900/80 text-green-300'
    if (score < 60) return 'bg-yellow-900/80 text-yellow-300'
    return 'bg-red-900/80 text-red-300'
  }

  const getRiskLabel = (score) => {
    if (score < 30) return 'LOW'
    if (score < 60) return 'MEDIUM'
    return 'HIGH'
  }

  return (
    <Card className="xbox-glow-hover border-xbox-green/30 bg-xbox-gray/70 overflow-hidden">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center font-bold ${
                transaction.type === 'lend'
                  ? 'bg-green-900/30 text-green-300'
                  : 'bg-red-900/30 text-red-300'
              }`}
            >
              {transaction.type === 'lend' ? '→' : '←'}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {transaction.type === 'lend' ? 'Lending' : 'Borrowing'}
              </p>
              <p className="text-2xl font-bold">
                {transaction.amount.toLocaleString()} ETH
              </p>
              <p className="text-xs text-gray-500 mt-1">ID: {transaction.id}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Account</p>
            <p className="font-mono text-sm font-bold text-xbox-green">
              {transaction.publicKey}
            </p>
            <p className="text-xs text-gray-500 mt-1">On-chain identity</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Public Key</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-bold text-xbox-green/90">
                {transaction.publicKey}
              </p>
              <button
                onClick={() => onCopy(transaction.publicKey, transaction.id)}
                className="p-1 hover:bg-xbox-green/20 rounded transition"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copiedKey === transaction.id ? 'text-green-400' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>
            {copiedKey === transaction.id && (
              <p className="text-xs text-green-400 mt-1">Copied!</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Risk Score</p>
            <div className={`inline-flex px-3 py-2 rounded font-bold text-sm ${getRiskColor(
              transaction.riskScore
            )}`}>
              {transaction.riskScore} • {getRiskLabel(transaction.riskScore)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {transaction.riskScore < 30
                ? '✓ Safe corridor'
                : transaction.riskScore < 60
                ? '⚠ Tactical caution'
                : '✗ High volatility'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Timeline</p>
            <Badge className="mb-3 bg-xbox-green/10 text-xbox-green border-xbox-green/40 uppercase tracking-wider">
              Due {transaction.dueDate}
            </Badge>
            <p className="text-xs text-gray-500">
              Initiated{' '}
              <span className="text-white font-mono">{transaction.date}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Dashboard