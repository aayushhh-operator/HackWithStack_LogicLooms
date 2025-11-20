import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { TrendingDown, Wallet, DollarSign, Clock, AlertCircle, CheckCircle, X, Plus } from 'lucide-react';

const BorrowerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, connectWallet } = useWeb3();
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    duration: '30',
    purpose: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmitLoan = () => {
    if (!loanForm.amount || parseFloat(loanForm.amount) <= 0) {
      alert('Please enter a valid loan amount');
      return;
    }
    // TODO: Integrate with smart contract to request loan
    console.log('Submitting loan request:', loanForm);
    alert(`Loan request submitted for ${loanForm.amount} ETH!`);
    setShowLoanModal(false);
    setLoanForm({ amount: '', duration: '30', purpose: '' });
  };

  const handleViewLoanDetails = (loanId) => {
    // TODO: Navigate to loan details page or show modal
    console.log('Viewing loan details for ID:', loanId);
    alert(`Viewing details for loan ${loanId}`);
  };

  const myLoans = [
    { id: 1, amount: '2.5 ETH', interest: '10%', duration: '90 days', status: 'active', dueDate: '2025-03-15', funded: true },
    { id: 2, amount: '1.0 ETH', interest: '8%', duration: '60 days', status: 'pending', dueDate: '2025-02-20', funded: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Borrower Dashboard</h1>
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
              <div className="text-sm text-gray-600">Total Borrowed</div>
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-black">3.5 ETH</div>
            <div className="text-xs text-gray-500 mt-1">≈ $7,245.00</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Active Loans</div>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-black">2</div>
            <div className="text-xs text-green-600 mt-1">All on time</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Credit Score</div>
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">Good</div>
            <div className="text-xs text-gray-500 mt-1">750/850</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Available Credit</div>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-black">5.0 ETH</div>
            <div className="text-xs text-gray-500 mt-1">Based on score</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button onClick={() => setShowLoanModal(true)} className="btn-primary px-6 py-3 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Request New Loan
          </button>
        </div>

        {/* My Loans Section */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">My Loans</h2>
          <div className="grid gap-4">
            {myLoans.map((loan) => (
              <div key={loan.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${loan.funded ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {loan.funded ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-yellow-600" />}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-black">{loan.amount}</div>
                      <div className={`text-sm ${loan.funded ? 'text-green-600' : 'text-yellow-600'}`}>
                        {loan.funded ? 'Active' : 'Pending Funding'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Due Date</div>
                    <div className="text-lg font-semibold text-black">{loan.dueDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Interest Rate</div>
                    <div className="text-lg font-semibold text-black">{loan.interest}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Duration</div>
                    <div className="text-lg font-semibold text-black">{loan.duration}</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => handleViewLoanDetails(loan.id)} className="btn-outline text-sm px-4 py-2">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Request Loan</h3>
              <button onClick={() => setShowLoanModal(false)} className="text-gray-600 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount (ETH)</label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <select
                  value={loanForm.duration}
                  onChange={(e) => setLoanForm({ ...loanForm, duration: e.target.value })}
                  className="input-field"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose (Optional)</label>
                <textarea
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Brief description of loan purpose..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-900 mb-2 font-semibold">Estimated Terms</div>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold">8-12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span className="font-semibold">0.5%</span>
                  </div>
                </div>
              </div>

              <button onClick={handleSubmitLoan} className="btn-primary w-full py-3 text-lg">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerDashboard;
