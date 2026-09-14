import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, AlertTriangle, CreditCard, Settings,
  LogOut, Heart, Menu, X, Banknote, Sun, Moon, Shield, Wallet, DollarSign
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/verifications', icon: Shield, label: 'Verifications' },
    { path: '/withdrawals', icon: Wallet, label: 'Withdrawals' },
    { path: '/reports', icon: AlertTriangle, label: 'Reports' },
    { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/plans', icon: Heart, label: 'Premium Plans' },
    { path: '/payment-settings', icon: Banknote, label: 'Payment Settings' },
    { path: '/female-earnings', icon: DollarSign, label: 'Female Earnings' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar – fixed on all screens */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl border-r transform transition-transform duration-300 lg:translate-x-0 flex flex-col
          ${isDark ? 'bg-dark-900/80 border-dark-800/50' : 'bg-white border-gray-200'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Connecto Logo" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ConnectX</h1>
              <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className={`lg:hidden ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation – scrollable if many items */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout – always at bottom */}
        <div className={`p-4 border-t ${isDark ? 'border-dark-800/50' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`sidebar-link w-full ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area – shifted right on desktop to avoid fixed sidebar */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 lg:ml-72`}>
        <header
          className={`h-16 backdrop-blur-xl border-b flex items-center px-6 sticky top-0 z-30
            ${isDark ? 'bg-dark-900/50 border-dark-800/50' : 'bg-white/80 border-gray-200'}`}
        >
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden mr-4 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <h2 className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Welcome back,</h2>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>ConnectX Admin</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              CA
            </div>
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;