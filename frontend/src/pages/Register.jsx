import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('borrower');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = () => {
    setError('');
    if (currentStep === 1 && !role) {
      setError('Please select a role');
      return false;
    }
    if (currentStep === 2) {
      if (!email || !password || !confirmPassword) {
        setError('All fields are required');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    if (currentStep === 3 && (!fullName || !phone)) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      await register(email, password, role, fullName, phone);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="text-2xl font-semibold tracking-tight text-black">MicroLend</div>
          </Link>
          <h1 className="text-3xl font-semibold text-black">Create Account</h1>
          <p className="text-gray-500 mt-2">Step {currentStep} of 3</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-black mb-2">Choose Your Role</h2>
                  <p className="text-gray-500">Select how you want to use MicroLend</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('borrower')}
                    className={`p-6 rounded-lg border-2 transition-all text-center ${
                      role === 'borrower' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">💰</div>
                    <div className="font-semibold text-black text-lg">Borrower</div>
                    <div className="text-sm text-gray-500 mt-2">Request loans with AI-powered risk assessment</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('lender')}
                    className={`p-6 rounded-lg border-2 transition-all text-center ${
                      role === 'lender' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">📈</div>
                    <div className="font-semibold text-black text-lg">Lender</div>
                    <div className="text-sm text-gray-500 mt-2">Fund loans and earn competitive returns</div>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-black mb-2">Account Credentials</h2>
                  <p className="text-gray-500">Create your secure login</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-black mb-2">Personal Information</h2>
                  <p className="text-gray-500">Tell us about yourself</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button type="button" onClick={handleBack} className="btn-secondary px-6 py-3">
                  ← Back
                </button>
              ) : (
                <div></div>
              )}
              {currentStep < 3 ? (
                <button type="button" onClick={handleNext} className="btn-primary px-6 py-3">
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn-primary px-6 py-3">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
