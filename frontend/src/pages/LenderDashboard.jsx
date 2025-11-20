import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { TrendingUp, Wallet, DollarSign, Shield, AlertTriangle, CheckCircle, Filter } from 'lucide-react';

const LenderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, connectWallet } = useWeb3();
  const [riskFilter, setRiskFilter] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFundLoan = (loan) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    // TODO: Integrate with smart contract to fund loan
    console.log('Funding loan:', loan);
    alert(`Funding loan of ${loan.amount} for borrower ${loan.borrower}`);
  };

  const handleViewInvestmentDetails = (investmentId) => {
    // TODO: Navigate to investment details page or show modal
    console.log('Viewing investment details for ID:', investmentId);
    alert(`Viewing details for investment ${investmentId}`);
  };

  const availableLoans = [
    { id: 1, borrower: '0x8623...a684', amount: '2.5 ETH', interest: '10%', duration: '90 days', risk: 'low', creditScore: 750, purpose: 'Business expansion' },
    { id: 2, borrower: '0x9234...b795', amount: '1.0 ETH', interest: '12%', duration: '60 days', risk: 'medium', creditScore: 650, purpose: 'Personal loan' },
    { id: 3, borrower: '0x7345...c806', amount: '3.0 ETH', interest: '15%', duration: '120 days', risk: 'high', creditScore: 580, purpose: 'Debt consolidation' },
    { id: 4, borrower: '0x6456...d917', amount: '0.5 ETH', interest: '8%', duration: '30 days', risk: 'low', creditScore: 800, purpose: 'Emergency funds' },
  ];

  const myInvestments = [
    { id: 1, borrower: '0x5567...e028', amount: '1.5 ETH', interest: '10%', status: 'active', dueDate: '2025-03-01', progress: 60 },
    { id: 2, borrower: '0x4678...f139', amount: '2.0 ETH', interest: '11%', status: 'active', dueDate: '2025-02-15', progress: 80 },
  ];

  const filteredLoans = riskFilter === 'all' ? availableLoans : availableLoans.filter(loan => loan.risk === riskFilter);

  const getRiskBadge = (risk) => {
    const styles = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[risk] || styles.low;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Lender Dashboard</h1>
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
              <button onClick={handleLogout} className="btn-outline text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Invested</div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-black">3.5 ETH</div>
            <div className="text-xs text-gray-500 mt-1">≈ $7,245.00</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Earnings</div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">0.35 ETH</div>
            <div className="text-xs text-gray-500 mt-1">10% APY</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Active Loans</div>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-black">2</div>
            <div className="text-xs text-green-600 mt-1">All performing</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Portfolio Risk</div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">Low</div>
            <div className="text-xs text-gray-500 mt-1">Diversified</div>
          </div>
        </div>

        {/* My Investments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">My Investments</h2>
          <div className="grid gap-4">
            {myInvestments.map((investment) => (
              <div key={investment.id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-black">{investment.amount}</div>
                      <div className="text-sm text-gray-600">Borrower: {investment.borrower}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Expected Return</div>
                    <div className="text-lg font-semibold text-green-600">{investment.interest}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Repayment Progress</span>
                    <span>{investment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${investment.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Due: {investment.dueDate}</div>
                  <button onClick={() => handleViewInvestmentDetails(investment.id)} className="btn-outline text-sm px-4 py-2">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Loan Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Available Opportunities</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field text-sm py-2"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl font-bold text-black">{loan.amount}</div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(loan.risk)}`}>
                        {loan.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Borrower: {loan.borrower}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{loan.interest}</div>
                    <div className="text-xs text-gray-600">Interest Rate</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Duration</div>
                    <div className="text-sm font-semibold text-black">{loan.duration}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Credit Score</div>
                    <div className="text-sm font-semibold text-black">{loan.creditScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Purpose</div>
                    <div className="text-sm font-semibold text-black truncate">{loan.purpose}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">AI Risk Assessment: {loan.risk === 'low' ? '92.3%' : loan.risk === 'medium' ? '75.5%' : '58.2%'} Confidence</div>
                  <button onClick={() => handleFundLoan(loan)} className="btn-primary px-6 py-2">Fund Loan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
