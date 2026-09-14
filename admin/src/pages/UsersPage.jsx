import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { Search, ChevronLeft, ChevronRight, Shield, Ban, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { isDark, text, bg, border } = useThemeClasses();

  const statusBadge = {
    premium: isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
    verified: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600',
    banned: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600',
    free: isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-100 text-gray-600',
  };

  useEffect(() => { fetchUsers(); }, [page, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20, search, status } });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleBan = async (userId, currentBanStatus) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { banned: !currentBanStatus });
      toast.success(currentBanStatus ? 'User unbanned' : 'User banned');
      fetchUsers();
    } catch (error) { toast.error('Action failed'); }
  };

  const handleVerify = async (userId, currentVerifyStatus) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { verified: !currentVerifyStatus });
      toast.success(currentVerifyStatus ? 'Verification removed' : 'User verified');
      fetchUsers();
    } catch (error) { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>Users</h1>
        <p className={text.muted}>{total} total users</p>
      </div>

      <div className="glass-card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${text.muted}`} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10" placeholder="Search by name, email, phone..." />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="premium">Premium</option>
            <option value="verified">Verified</option>
            <option value="banned">Banned</option>
            <option value="new">New (7 days)</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className={`text-center py-12 ${text.muted}`}>No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${border.default}`}>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>User</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Gender</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>City</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Status</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Joined</th>
                  <th className={`text-right p-4 text-sm font-semibold ${text.secondary}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                        <div>
                          <Link to={`/users/${user.id}`} className={`font-medium hover:text-primary-400 transition-colors ${text.primary}`}>
                            {user.name}
                          </Link>
                          <p className={`text-xs ${text.muted}`}>{user.email || user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${text.secondary} capitalize`}>{user.gender || '-'}</td>
                    <td className={`p-4 ${text.secondary}`}>{user.city || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.is_premium ? <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.premium}`}>Premium</span> : null}
                        {user.is_verified ? <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.verified}`}>Verified</span> : null}
                        {user.is_banned ? <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.banned}`}>Banned</span> : null}
                        {!user.is_premium && !user.is_verified && !user.is_banned ? <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.free}`}>Free</span> : null}
                      </div>
                    </td>
                    <td className={`p-4 ${text.muted} text-sm`}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/users/${user.id}`} className={`p-2 rounded-lg ${bg.hover} ${text.muted} hover:text-primary-400 transition-colors`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleVerify(user.id, user.is_verified)}
                          className={`p-2 rounded-lg transition-colors ${user.is_verified ? 'hover:bg-green-500/10 text-green-400' : `${bg.hover} ${text.muted} hover:text-green-400`}`}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleBan(user.id, user.is_banned)}
                          className={`p-2 rounded-lg transition-colors ${user.is_banned ? 'hover:bg-red-500/10 text-red-400' : `${bg.hover} ${text.muted} hover:text-red-400`}`}>
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${text.muted}`}>Page {page} of {totalPages} ({total} users)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
