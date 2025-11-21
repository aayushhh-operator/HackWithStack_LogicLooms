import {
  ArrowRight,
  ChevronRight,
  Lock,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import AuthModal from "../components/auth-modal";
import { Button } from "../components/ui/button";
import UserProfile from "../components/user-profile";

const LandingPage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("logiclooms:user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("logiclooms:user");
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    // userData is the full user object from the API response
    setUser(userData);
    localStorage.setItem("logiclooms:user", JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("logiclooms:user");
    localStorage.removeItem("logiclooms:token");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black overflow-hidden">
      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-black">MICROLEND</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              FEATURES
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              HOW IT WORKS
            </a>
            <a
              href="#stats"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              IMPACT
            </a>
          </div>
          {user ? (
            <UserProfile
              name={user.name}
              email={user.email}
              role={user.role}
              onLogout={handleLogout}
            />
          ) : (
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative bg-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-600 text-sm font-mono">
                  {"<ACCESS_UNLIMITED />"}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-black">
                LENDING
                <br />
                <span className="text-blue-600">REIMAGINED</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-sm">
                Millions shut out from traditional banking. We're breaking down
                barriers with AI-powered risk assessment and blockchain
                security. Your credit history doesn't define you—your potential
                does.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="btn-primary font-bold"
                  onClick={() => setIsAuthOpen(true)}
                >
                  GET FUNDED NOW <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-outline font-bold opacity-50 cursor-not-allowed"
                  disabled
                >
                  WATCH DEMO
                </Button>
              </div>
            </div>
            {/* Right side - Visual element */}
            <div className="relative h-96 hidden md:flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-100/50 rounded-lg blur-3xl" />
              <div className="relative">
                {/* Floating cards with data */}
                <div className="absolute top-0 left-0 glass-card border border-blue-200 p-4 rounded-lg shadow-lg max-w-xs transform -rotate-12 hover:rotate-0 transition duration-300">
                  <div className="text-blue-600 text-sm font-mono mb-2">
                    AI_RISK_SCORE
                  </div>
                  <div className="text-3xl font-black text-black">8.7/10</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Smart Assessment
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 glass-card border border-blue-200 p-4 rounded-lg shadow-lg max-w-xs transform rotate-12 hover:rotate-0 transition duration-300">
                  <div className="text-blue-600 text-sm font-mono mb-2">
                    ETHEREUM_ESCROW
                  </div>
                  <div className="text-2xl font-black text-black">$2.4M</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Locked & Secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-16 px-4 bg-blue-50 border-y border-blue-200"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
                47M
              </div>
              <div className="text-sm text-gray-600">Unbanked Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
                99.2%
              </div>
              <div className="text-sm text-gray-600">Repayment Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
                $680M
              </div>
              <div className="text-sm text-gray-600">Disbursed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
                180+
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-black">
            POWER-UP YOUR <span className="text-blue-600">FINANCIAL</span> GAME
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "ETHEREUM ESCROW",
                description:
                  "Blockchain-verified transactions. Your money, cryptographically secured. No middlemen, no delays.",
                stats: "$0 - $50K",
              },
              {
                icon: Zap,
                title: "AI RISK RATING",
                description:
                  "Neural networks analyze 500+ data points. Better decisions than humans. Approved in 60 seconds.",
                stats: "Real-time",
              },
              {
                icon: TrendingUp,
                title: "DYNAMIC RATES",
                description:
                  "Your rate adjusts as you build credit. Better behavior = better rates. Automatic rewards.",
                stats: "5-24% APR",
              },
              {
                icon: Wallet,
                title: "INSTANT PAYOUTS",
                description:
                  "Funds hit your wallet instantly. Stablecoin or fiat. No waiting, no gatekeepers.",
                stats: "< 30 seconds",
              },
              {
                icon: Lock,
                title: "ZERO DEFAULTS",
                description:
                  "Smart contracts auto-execute. Non-repayment = automatic collateral liquidation.",
                stats: "Guaranteed",
              },
              {
                icon: Zap,
                title: "SOCIAL CREDIT",
                description:
                  "Build your credit history. Peer vouching boosts your score. Community-powered lending.",
                stats: "Decentralized",
              },
            ].map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group relative glass-card border-2 p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  hoveredFeature === index
                    ? "border-blue-600 shadow-lg shadow-blue-500/30 scale-105"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Background glow on hover */}
                {hoveredFeature === index && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent rounded-xl blur-xl" />
                )}
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 mb-4 flex items-center justify-center rounded-lg ${
                      hoveredFeature === index
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black mb-2 text-black">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-600">
                      {feature.stats}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        hoveredFeature === index ? "translate-x-2" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-white border-y border-gray-200"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-black">
            THREE STEPS TO{" "}
            <span className="text-blue-600">FINANCIAL FREEDOM</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-32 left-1/3 right-1/3 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            {[
              {
                num: "01",
                title: "CONNECT",
                desc: "Link your identity. Instant verification. No docs.",
              },
              {
                num: "02",
                title: "AI SCORES",
                desc: "Machine learning analyzes your potential instantly.",
              },
              {
                num: "03",
                title: "BORROW & BUILD",
                desc: "Get funded. Repay. Build your credit history.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {step.num}
                  </span>
                </div>
                <div className="pt-16 text-center">
                  <h3 className="text-xl font-black mb-3 text-black">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-blue-50">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
            <span className="text-blue-600 text-sm font-mono">
              {"<JOIN_REVOLUTION />"}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
            READY TO LEVEL UP?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join millions of borrowers breaking free from traditional banking
            constraints. Your AI-powered path to financial inclusion starts now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="btn-primary font-bold text-base h-12 px-8"
              onClick={() => setIsAuthOpen(true)}
            >
              START BORROWING <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-outline font-bold text-base h-12 px-8"
              onClick={() => setIsAuthOpen(true)}
            >
              BECOME A LENDER
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-blue-600">PRODUCT</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#features"
                    className="hover:text-blue-600 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-600">COMPANY</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-600">LEGAL</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-600">CONNECT</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
            <div>© 2025 MicroLend. All rights reserved.</div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Lock className="w-4 h-4" />
              <span>Ethereum Powered • AI Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
