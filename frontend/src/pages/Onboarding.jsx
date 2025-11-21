import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Check } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'

const Onboarding = () => {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState('')
  const navigate = useNavigate()
  const { account, connectWallet, isConnecting } = useWeb3()

  const handleUserTypeSelect = (type) => {
    setUserType(type)
    setStep(2)
  }

  const handleWalletConnect = async () => {
    try {
      await connectWallet()
      setStep(3)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleComplete = () => {
    // Update user profile with userType
    const user = JSON.parse(localStorage.getItem('logiclooms:user') || '{}')
    user.userType = userType
    localStorage.setItem('logiclooms:user', JSON.stringify(user))

    // Navigate to appropriate dashboard
    if (userType === 'borrower') {
      navigate('/borrower')
    } else {
      navigate('/lender')
    }
  }

  const skipWallet = () => {
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl px-8">
        <div className="glass-card p-10 rounded-xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
              <span className="text-sm font-medium text-blue-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Choose User Type */}
          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-black">Welcome to LogicLooms!</h1>
                <p className="text-gray-500">Tell us how you'd like to use our platform</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Borrower Option */}
                <button
                  onClick={() => handleUserTypeSelect('borrower')}
                  className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="absolute top-4 right-4 w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-600 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                    <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                  
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <TrendingDown className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-black">I'm a Borrower</h3>
                  <p className="text-gray-600 text-sm">
                    Looking to get instant loans with AI-powered risk assessment and competitive rates.
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span>Request loans instantly</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span>AI risk assessment</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span>Flexible repayment terms</span>
                      </li>
                    </ul>
                  </div>
                </button>

                {/* Lender Option */}
                <button
                  onClick={() => handleUserTypeSelect('lender')}
                  className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="absolute top-4 right-4 w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-600 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                    <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                  
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-black">I'm a Lender</h3>
                  <p className="text-gray-600 text-sm">
                    Ready to earn interest by funding loans and building a diversified lending portfolio.
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Earn competitive returns</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Diversify your portfolio</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Transparent risk metrics</span>
                      </li>
                    </ul>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Connect Wallet */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-black">Connect Your Wallet</h1>
                <p className="text-gray-500">
                  Connect your MetaMask wallet to interact with smart contracts on the blockchain
                </p>
              </div>

              {!account ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Why connect a wallet?</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Securely sign transactions on the blockchain</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Access your lending and borrowing history</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Manage your loans with full transparency</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                  </button>

                  <button
                    onClick={skipWallet}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
                  >
                    Skip for now (you can connect later)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Wallet Connected</p>
                        <p className="text-sm text-green-700 font-mono">
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
              >
                ← Go Back
              </button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-black">You're All Set!</h1>
                <p className="text-gray-500">
                  Your account is ready. Let's get started with {userType === 'borrower' ? 'borrowing' : 'lending'}.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-semibold text-black capitalize">{userType}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Wallet Status:</span>
                    <span className={`font-semibold ${account ? 'text-green-600' : 'text-gray-400'}`}>
                      {account ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  {account && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Wallet Address:</span>
                      <span className="font-mono text-sm text-black">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleComplete}
                  className="btn-primary w-full py-4 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
              >
                ← Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
