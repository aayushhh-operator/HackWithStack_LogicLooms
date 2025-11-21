import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const API_URL = "http://localhost:5000/api";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (mode === "signup") {
      if (!name || !email || !phone || !password) {
        setError("All fields are required");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }
    } else {
      if (!email || !password) {
        setError("Email and password required");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        // Signup API call
        const response = await fetch(`${API_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Signup failed");
          setIsLoading(false);
          return;
        }

        // Store user data and token
        localStorage.setItem("logiclooms:user", JSON.stringify(data.user));
        localStorage.setItem("logiclooms:token", data.user.token);

        // Call success handler with full user data
        onAuthSuccess(data.user);
        setIsLoading(false);

        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
      } else {
        // Login API call
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Login failed");
          setIsLoading(false);
          return;
        }

        // Store user data and token
        localStorage.setItem("logiclooms:user", JSON.stringify(data.user));
        localStorage.setItem("logiclooms:token", data.user.token);

        // Call success handler with full user data
        onAuthSuccess(data.user);
        setIsLoading(false);

        // Reset form
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Grid background overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16, 124, 16, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 124, 16, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md mx-4 bg-xbox-gray border-2 border-xbox-green p-8 rounded-sm shadow-2xl shadow-xbox-green/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-3 py-1 bg-xbox-green/10 border border-xbox-green rounded-sm">
            <span className="text-xbox-green text-xs font-mono">
              {"<AUTHENTICATE />"}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {mode === "login" ? "LOGIN" : "JOIN"}
          </h2>
          <p className="text-sm text-gray-400">
            {mode === "login"
              ? "Access your lending account"
              : "Start your journey today"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
              />
            </div>
          </div>

          {/* Phone (Signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                PHONE NUMBER
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                  className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
                />
              </div>
            </div>
          )}

          {/* User Type (Signup only) */}
          {/* Removed userType UI completely */}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-10 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xbox-green/50 hover:text-xbox-green transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-600 rounded-sm text-red-300 text-sm font-mono">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-xbox-green text-white hover:bg-xbox-green-light rounded-sm font-bold mt-6"
          >
            {isLoading ? (
              "PROCESSING..."
            ) : (
              <>
                {mode === "login" ? "LOGIN NOW" : "CREATE ACCOUNT"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              New to MicroLend?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setName("");
                  setEmail("");
                  setPhone("");
                  setPassword("");
                  setConfirmPassword("");
                  // setUserType('borrower') // REMOVE THIS LINE
                }}
                className="text-xbox-green font-bold hover:underline"
              >
                SIGN UP
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setName("");
                  setEmail("");
                  setPhone("");
                  setPassword("");
                  setConfirmPassword("");
                  // setUserType('borrower') // REMOVE THIS LINE
                }}
                className="text-xbox-green font-bold hover:underline"
              >
                LOGIN
              </button>
            </>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-6 pt-6 border-t border-xbox-green/20 flex items-center gap-2 text-xs text-gray-400">
          <Lock className="w-4 h-4 text-xbox-green" />
          <span>256-bit encrypted • Ethereum verified</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
