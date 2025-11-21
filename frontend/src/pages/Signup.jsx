import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  DollarSign,
  Lock,
  Mail,
  Phone,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../contexts/AuthContext";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "",
    age: "",
    income: "",
    employmentLength: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useWeb3();
  const { register } = useAuth();

  const handleNextStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!formData.age || !formData.income || !formData.employmentLength) {
        setError("Please fill in all financial information");
        return;
      }
      if (formData.age < 18 || formData.age > 100) {
        setError("Age must be between 18 and 100");
        return;
      }
      if (formData.income < 0) {
        setError("Income must be a positive number");
        return;
      }
      if (formData.employmentLength < 0) {
        setError("Employment length must be a positive number");
        return;
      }
      setError("");
      setStep(3);
    } else if (step === 3) {
      if (!formData.userType) {
        setError("Please select if you are a borrower or lender");
        return;
      }
      setError("");
      setStep(4);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      setStep(5);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleSkipWallet = () => {
    setStep(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.userType,
        parseInt(formData.age),
        parseFloat(formData.income),
        parseInt(formData.employmentLength)
      );

      // Navigate to dashboard - it will redirect to appropriate page
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center py-12">
      <div className="relative z-10 w-full max-w-2xl px-8">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Signup Card */}
        <div className="glass-card p-10 rounded-xl animate-slide-up">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {step} of 5
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round((step / 5) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-xl mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-black">
              {step === 1 && "Join LogicLooms"}
              {step === 2 && "Financial Information"}
              {step === 3 && "Choose Your Role"}
              {step === 4 && "Connect Wallet"}
              {step === 5 && "Review & Complete"}
            </h1>
            <p className="text-gray-500">
              {step === 1 && "Create your account to get started"}
              {step === 2 && "Help us calculate your risk score"}
              {step === 3 && "Are you looking to borrow or lend?"}
              {step === 4 && "Connect your MetaMask wallet (optional)"}
              {step === 5 && "Confirm your details and create account"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="input-field pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="input-field pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                onClick={handleNextStep}
                className="btn-primary w-full py-4 text-lg"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Step 2: Financial Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  This information helps us calculate your personalized risk
                  score and provide better loan terms.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="input-field pl-12"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Income ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1000"
                    className="input-field pl-12"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employment Length (years)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="number"
                    name="employmentLength"
                    value={formData.employmentLength}
                    onChange={handleChange}
                    required
                    min="0"
                    max="50"
                    step="0.5"
                    className="input-field pl-12"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="btn-primary flex-1 py-3"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Role */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setFormData({ ...formData, userType: "borrower" })
                  }
                  className={`group relative p-6 border-2 rounded-xl transition-all text-left ${
                    formData.userType === "borrower"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-black">
                    I'm a Borrower
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get instant loans with competitive rates
                  </p>
                  {formData.userType === "borrower" && (
                    <Check className="absolute top-4 right-4 w-6 h-6 text-blue-600" />
                  )}
                </button>
                <button
                  onClick={() =>
                    setFormData({ ...formData, userType: "lender" })
                  }
                  className={`group relative p-6 border-2 rounded-xl transition-all text-left ${
                    formData.userType === "lender"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-black">
                    I'm a Lender
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Earn returns by funding loans
                  </p>
                  {formData.userType === "lender" && (
                    <Check className="absolute top-4 right-4 w-6 h-6 text-blue-600" />
                  )}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="btn-primary flex-1 py-3"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Connect Wallet */}
          {step === 4 && (
            <div className="space-y-6">
              {!account ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Why connect a wallet?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5" />
                        <span>Secure blockchain transactions</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5" />
                        <span>Access lending history</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 mt-0.5" />
                        <span>Full transparency</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                  <button
                    onClick={handleSkipWallet}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">
                          Wallet Connected
                        </p>
                        <p className="text-sm text-green-700 font-mono">
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(5)}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    Continue
                  </button>
                </>
              )}
              <button
                onClick={() => setStep(3)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-black">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-black">
                    {formData.email}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-black">
                    {formData.phone}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold text-black">
                    {formData.age} years
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Income:</span>
                  <span className="font-semibold text-black">
                    ${parseFloat(formData.income).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Employment:</span>
                  <span className="font-semibold text-black">
                    {formData.employmentLength} years
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-semibold text-black capitalize">
                    {formData.userType}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Wallet:</span>
                  <span
                    className={`font-semibold ${
                      account ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {account
                      ? `${account.slice(0, 6)}...${account.slice(-4)}`
                      : "Not Connected"}
                  </span>
                </div>
              </div>
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 py-4 text-lg disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
