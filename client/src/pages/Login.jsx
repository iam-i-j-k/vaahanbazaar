import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.role) {
      setError('Please select whether you are a Dealer or Seller');
      setLoading(false);
      return;
    }

    try {
      await login({
        email: form.email,
        password: form.password,
        role: form.role,
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your Vahan Bazar account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('dealer')}
            className={`p-3 rounded-lg border-2 text-center font-semibold transition ${
              form.role === 'dealer'
                ? 'border-blue-900 bg-blue-50 text-blue-900'
                : 'border-gray-300 text-gray-700 hover:border-blue-500'
            }`}
          >
            I’m a Dealer
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('user')}
            className={`p-3 rounded-lg border-2 text-center font-semibold transition ${
              form.role === 'user'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                : 'border-gray-300 text-gray-700 hover:border-yellow-400'
            }`}
          >
            I’m a Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-yellow-400 font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-900 font-semibold hover:text-blue-700">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">Dealer: Dealer@example.com / Dealer123</p>
          <p className="text-xs text-gray-600">Seller: seller@example.com / seller123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
