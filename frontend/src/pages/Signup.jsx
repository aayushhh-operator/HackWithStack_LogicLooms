import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, ArrowLeft } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'borrower',
  })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    // TODO: Implement actual authentication
    navigate('/dashboard')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden flex items-center justify-center py-12">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-xbox-green transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-xbox-gray/80 backdrop-blur-lg p-10 rounded-2xl border border-xbox-green/30 glow-border animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-xbox-green rounded-2xl mb-4 glow-border">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2 glow-text">Join LogicLooms</h1>
            <p className="text-gray-400">Create your account and start lending</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-xbox-green" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-xbox-dark border border-xbox-green/30 rounded-lg text-white focus:outline-none focus:border-xbox-green focus:ring-2 focus:ring-xbox-green/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-xbox-green" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-xbox-dark border border-xbox-green/30 rounded-lg text-white focus:outline-none focus:border-xbox-green focus:ring-2 focus:ring-xbox-green/50 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'borrower' })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                    formData.userType === 'borrower'
                      ? 'border-xbox-green bg-xbox-green/20 text-xbox-green glow-border'
                      : 'border-xbox-green/30 text-gray-400 hover:border-xbox-green/50'
                  }`}
                >
                  Borrow
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'lender' })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                    formData.userType === 'lender'
                      ? 'border-xbox-green bg-xbox-green/20 text-xbox-green glow-border'
                      : 'border-xbox-green/30 text-gray-400 hover:border-xbox-green/50'
                  }`}
                >
                  Lend
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-xbox-green" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 bg-xbox-dark border border-xbox-green/30 rounded-lg text-white focus:outline-none focus:border-xbox-green focus:ring-2 focus:ring-xbox-green/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-xbox-green" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 bg-xbox-dark border border-xbox-green/30 rounded-lg text-white focus:outline-none focus:border-xbox-green focus:ring-2 focus:ring-xbox-green/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 bg-xbox-dark border-xbox-green/30 rounded text-xbox-green focus:ring-xbox-green"
              />
              <span className="text-sm text-gray-400">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-4 bg-xbox-green hover:bg-xbox-green-light rounded-lg text-white font-bold text-lg transition-all duration-300 glow-border hover:scale-105"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-xbox-green hover:text-xbox-green-light font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup