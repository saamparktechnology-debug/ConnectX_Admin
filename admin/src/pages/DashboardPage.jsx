import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import {
  Users, Heart, MessageCircle, TrendingUp, DollarSign, AlertTriangle,
  UserPlus, Shield, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, trend, isDark }) => (
  <div className="glass-card p-6 group hover:border-primary-500/30 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% from yesterday
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const genderData = [
    { name: 'Male', value: stats?.maleUsers || 0, color: '#3b82f6' },
    { name: 'Female', value: stats?.femaleUsers || 0, color: '#ec4899' },
  ];

  const gridColor = isDark ? '#334155' : '#e5e7eb';
  const textColor = isDark ? '#64748b' : '#9ca3af';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>Overview of your Connecto dating app</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0}
          color="bg-gradient-to-br from-primary-500 to-primary-600" isDark={isDark} />
        <StatCard icon={Activity} label="Active (24h)" value={stats?.activeUsers24h?.toLocaleString() || 0}
          color="bg-gradient-to-br from-green-500 to-emerald-600" isDark={isDark} />
        <StatCard icon={Heart} label="Total Matches" value={stats?.totalMatches?.toLocaleString() || 0}
          color="bg-gradient-to-br from-accent-500 to-accent-600" isDark={isDark} />
        <StatCard icon={MessageCircle} label="Total Messages" value={stats?.totalMessages?.toLocaleString() || 0}
          color="bg-gradient-to-br from-blue-500 to-blue-600" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserPlus} label="New Today" value={stats?.newUsersToday?.toLocaleString() || 0}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600" isDark={isDark} />
        <StatCard icon={Shield} label="Premium Users" value={stats?.premiumUsers?.toLocaleString() || 0}
          color="bg-gradient-to-br from-yellow-500 to-amber-600" isDark={isDark} />
        <StatCard icon={DollarSign} label="Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          color="bg-gradient-to-br from-green-500 to-green-600" isDark={isDark} />
        <StatCard icon={AlertTriangle} label="Pending Reports" value={stats?.pendingReports || 0}
          color="bg-gradient-to-br from-red-500 to-red-600" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Activity (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.dailyActive || []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} fontSize={12}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en', { weekday: 'short' })} />
              <YAxis stroke={textColor} fontSize={12} />
              <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#e2e8f0' : '#1f2937' }} />
              <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Gender Distribution</h3>
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                  paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#e2e8f0' : '#1f2937' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Signups (7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stats?.dailySignups || []}>
            <defs>
              <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} fontSize={12}
              tickFormatter={(val) => new Date(val).toLocaleDateString('en', { weekday: 'short' })} />
            <YAxis stroke={textColor} fontSize={12} />
            <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#e2e8f0' : '#1f2937' }} />
            <Area type="monotone" dataKey="count" stroke="#d946ef" strokeWidth={2} fill="url(#colorSignups)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
