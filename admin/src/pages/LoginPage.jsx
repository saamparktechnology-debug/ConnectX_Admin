import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to ConnectX Admin!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-primary-500/10' : 'bg-primary-200/50'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-accent-500/10' : 'bg-accent-200/50'}`}></div>
      </div>

      <button onClick={toggleTheme}
        className={`fixed top-4 right-4 z-10 p-2 rounded-xl transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Connecto Logo" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-4 shadow-lg shadow-primary-500/25" />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ConnectX Admin</h1>
            <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Sign in to manage your dating app</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-12" placeholder="admin@connecto.com" />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-12 pr-12" placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
