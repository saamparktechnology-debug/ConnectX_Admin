import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ReportsPage from './pages/ReportsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PlansPage from './pages/PlansPage';
import SettingsPage from './pages/SettingsPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import VerificationsPage from './pages/VerificationsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import FemaleEarningsPage from './pages/FemaleEarningsPage';

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  const { theme } = useTheme();
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return admin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#ec4899', secondary: '#fff' } }
          }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:userId" element={<UserDetailPage />} />
              <Route path="verifications" element={<VerificationsPage />} />
              <Route path="withdrawals" element={<WithdrawalsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="payment-settings" element={<PaymentSettingsPage />} />
              <Route path="female-earnings" element={<FemaleEarningsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
