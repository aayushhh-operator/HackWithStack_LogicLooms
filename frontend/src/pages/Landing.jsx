import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useWeb3();
  const { user } = useAuth();

  const handleGetStarted = async () => {
    if (!account) {
      await connectWallet();
    }
    if (user) {
      navigate(user.userType === "borrower" ? "/borrower" : "/lender");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" />

            <div className="flex items-center space-x-3">
              {account ? (
                <div className="glass-card px-3 py-1.5 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-mono text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-outline text-sm"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}

              {user ? (
                <button
                  onClick={() =>
                    navigate(
                      user.userType === "borrower" ? "/borrower" : "/lender"
                    )
                  }
                  className="btn-primary text-sm"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-outline text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn-primary text-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-black leading-tight">
              Smart Micro-Lending
              <br />
              for Everyone
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Access instant loans with AI-powered risk assessment and
              blockchain security. Transparent, efficient, and built for the
              modern economy.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="btn-primary px-8 py-4 text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                // Scroll to features section
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="btn-outline px-8 py-4 text-lg"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
            <div className="stat-card">
              <div className="text-3xl font-semibold text-black">92.3%</div>
              <div className="text-sm text-gray-500 mt-1">Model Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-semibold text-black">0.5%</div>
              <div className="text-sm text-gray-500 mt-1">Platform Fee</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-semibold text-black">Instant</div>
              <div className="text-sm text-gray-500 mt-1">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Loan Card */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Active Loan Request
                  </div>
                  <div className="text-3xl font-semibold text-black">
                    2.5 ETH
                  </div>
                </div>
                <div className="risk-low">Low Risk</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Interest Rate
                  </div>
                  <div className="text-xl font-semibold text-black">10%</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="text-xl font-semibold text-black">
                    90 days
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-sm font-medium text-black">
                  Risk Assessment
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Credit Score</span>
                    <span className="text-blue-600 font-medium">Excellent</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Debt-to-Income Ratio</span>
                    <span className="text-blue-600 font-medium">Good</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Payment History</span>
                    <span className="text-blue-600 font-medium">Stable</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (user) {
                    navigate(
                      user.userType === "lender" ? "/lender" : "/borrower"
                    );
                  } else {
                    navigate("/signup");
                  }
                }}
                className="btn-primary w-full py-3"
              >
                Fund This Loan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="container-custom py-20">
        <div className="text-center mb-12">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg shadow-blue-200">
              1
            </div>
            <h3 className="text-lg font-semibold text-black">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Link your Web3 wallet securely. We support MetaMask and other
              popular wallets.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg shadow-blue-200">
              2
            </div>
            <h3 className="text-lg font-semibold text-black">
              AI Risk Assessment
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our XGBoost model analyzes your profile instantly with 92.3%
              accuracy.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg shadow-blue-200">
              3
            </div>
            <h3 className="text-lg font-semibold text-black">
              Secure Transactions
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Smart contracts handle escrow automatically with complete
              transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose MicroLend</h2>
            <p className="section-subtitle">Built on cutting-edge technology</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-2xl">🤖</div>
              <div className="font-semibold text-black">AI-Powered</div>
              <div className="text-xs text-gray-500">XGBoost Risk Model</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-2xl">⛓️</div>
              <div className="font-semibold text-black">Blockchain</div>
              <div className="text-xs text-gray-500">
                Ethereum Smart Contracts
              </div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-2xl">📊</div>
              <div className="font-semibold text-black">Transparent</div>
              <div className="text-xs text-gray-500">SHAP Explainability</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-2xl">🔒</div>
              <div className="font-semibold text-black">Secure</div>
              <div className="text-xs text-gray-500">Decentralized Escrow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div>© 2025 MicroLend. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
