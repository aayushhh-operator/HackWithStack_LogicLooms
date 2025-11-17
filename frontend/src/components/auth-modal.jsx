import { useState } from 'react'
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!email || !password) {
      setError('Email and password required')
      setIsLoading(false)
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    // Simulate auth delay
    setTimeout(() => {
      onAuthSuccess(email, 'borrower')
      setIsLoading(false)
      // Reset form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setMode('login')
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Grid background overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16, 124, 16, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 124, 16, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
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
              {'<AUTHENTICATE />'}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {mode === 'login' ? 'LOGIN' : 'JOIN'}
          </h2>
          <p className="text-sm text-gray-400">
            {mode === 'login'
              ? 'Access your lending account'
              : 'Start your journey today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-xbox-dark border border-xbox-green/30 rounded-sm pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-xbox-green focus:ring-1 focus:ring-xbox-green transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
              <input
                type={showPassword ? 'text' : 'password'}
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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-xbox-green/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
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
              'PROCESSING...'
            ) : (
              <>
                {mode === 'login' ? 'LOGIN NOW' : 'CREATE ACCOUNT'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              New to LoanX?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="text-xbox-green font-bold hover:underline"
              >
                SIGN UP
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                  setPassword('')
                  setConfirmPassword('')
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
  )
}

export default AuthModal