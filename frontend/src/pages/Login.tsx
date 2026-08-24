import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-orange-50 text-festive-saffron rounded-2xl shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">SK Arts Notebook</h1>
          <p className="text-xs text-slate-400 font-semibold">Log in to manage your Ganpati booking notebook</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100 shadow-sm animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Type your username..."
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password..."
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center py-4 bg-festive-saffron hover:bg-orange-600 text-white font-extrabold rounded-xl text-sm transition-all btn-tap shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an owner account?{' '}
            <Link to="/register" className="font-extrabold text-festive-saffron hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
export { Login };
