import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, ArrowLeft } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }
      
      // Store user data and token
      localStorage.setItem('logiclooms:user', JSON.stringify(data.user))
      localStorage.setItem('logiclooms:token', data.user.token)
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden flex items-center justify-center">
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

        {/* Login Card */}
        <div className="bg-xbox-gray/80 backdrop-blur-lg p-10 rounded-2xl border border-xbox-green/30 glow-border animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-xbox-green rounded-2xl mb-4 glow-border">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2 glow-text">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your LogicLooms account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
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
                  className="w-full pl-12 pr-4 py-3 bg-xbox-dark border border-xbox-green/30 rounded-lg text-white focus:outline-none focus:border-xbox-green focus:ring-2 focus:ring-xbox-green/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-xbox-dark border-xbox-green/30 rounded text-xbox-green focus:ring-xbox-green"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link
                to="#"
                className="text-sm text-xbox-green hover:text-xbox-green-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-xbox-green hover:bg-xbox-green-light rounded-lg text-white font-bold text-lg transition-all duration-300 glow-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-xbox-green hover:text-xbox-green-light font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login