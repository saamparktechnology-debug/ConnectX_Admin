import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import {
  ChevronLeft, ChevronRight, Plus, X, TrendingUp, Clock, DollarSign,
  Target, Gift, Send, Eye, Trash2, Edit2, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const FemaleEarningsPage = () => {
  const [tab, setTab] = useState('overview');
  const [females, setFemales] = useState([]);
  const [bonusRules, setBonusRules] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [createModal, setCreateModal] = useState({ open: false });
  const [createForm, setCreateForm] = useState({
    female_user_id: '', title: 'Bonus Offer', target_minutes: '',
    bonus_amount: '', validity_days: '30'
  });
  const [femaleList, setFemaleList] = useState([]);
  const { isDark, text, bg, border } = useThemeClasses();

  useEffect(() => {
    if (tab === 'overview') fetchFemales();
    else if (tab === 'rules') fetchBonusRules();
    else if (tab === 'revenue') fetchRevenue();
  }, [tab, page, search]);

  const fetchFemales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/female-earnings', { params: { page, limit: 20, search } });
      setFemales(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBonusRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bonus-rules', { params: { page, limit: 20 } });
      setBonusRules(res.data.data.rules);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to fetch bonus rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/female-earnings/revenue');
      setRevenue(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch revenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchFemaleDetail = async (userId) => {
    try {
      const res = await api.get(`/admin/female-earnings/${userId}`);
      setDetailModal({ open: true, data: res.data.data });
    } catch (error) {
      toast.error('Failed to fetch detail');
    }
  };

  const fetchFemaleList = async () => {
    try {
      const res = await api.get('/admin/users', { params: { page: 1, limit: 200, gender: 'female' } });
      setFemaleList(res.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch female list', error);
    }
  };

  const handleCreateRule = async () => {
    if (!createForm.female_user_id || !createForm.target_minutes || !createForm.bonus_amount) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/admin/bonus-rules', {
        female_user_id: parseInt(createForm.female_user_id),
        title: createForm.title,
        target_minutes: parseInt(createForm.target_minutes),
        bonus_amount: parseFloat(createForm.bonus_amount),
        validity_days: parseInt(createForm.validity_days)
      });
      toast.success('Bonus rule created! Push notification sent.');
      setCreateModal({ open: false });
      setCreateForm({ female_user_id: '', title: 'Bonus Offer', target_minutes: '', bonus_amount: '', validity_days: '30' });
      fetchBonusRules();
    } catch (error) {
      toast.error('Failed to create bonus rule');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm('Delete this bonus rule?')) return;
    try {
      await api.delete(`/admin/bonus-rules/${id}`);
      toast.success('Bonus rule deleted');
      fetchBonusRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (id, isActive) => {
    try {
      await api.put(`/admin/bonus-rules/${id}`, { is_active: !isActive });
      toast.success(isActive ? 'Rule deactivated' : 'Rule activated');
      fetchBonusRules();
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const openCreateModal = () => {
    fetchFemaleList();
    setCreateModal({ open: true });
  };

  const tabs = [
    { key: 'overview', label: 'Female Users', icon: TrendingUp },
    { key: 'rules', label: 'Bonus Rules', icon: Target },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>Female Earnings</h1>
        <p className={text.muted}>Manage female user earnings and bonus offers</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-primary-500 text-white'
                : `${bg.hover} ${text.muted} hover:text-primary-400`
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, phone..."
              className={`input-field flex-1 max-w-sm`}
            />
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : females.length === 0 ? (
              <div className={`text-center py-12 ${text.muted}`}>No female users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${border.default}`}>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>User</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Total Minutes</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Total Earned</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Wallet Balance</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Active Bonuses</th>
                      <th className={`text-right p-4 text-sm font-semibold ${text.secondary}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {females.map((f) => (
                      <tr key={f.id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={f.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover bg-gray-200"
                            />
                            <div>
                              <p className={`font-medium ${text.primary}`}>{f.name || 'Unknown'}</p>
                              <p className={`text-xs ${text.muted}`}>{f.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`p-4 ${text.primary}`}>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-400" />
                            {f.total_minutes || 0} min
                          </div>
                        </td>
                        <td className={`p-4 font-semibold ${text.primary}`}>
                          Rs {Number(f.total_earned || 0).toLocaleString()}
                        </td>
                        <td className={`p-4 ${text.primary}`}>
                          Rs {Number(f.wallet_balance || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            f.active_bonuses > 0
                              ? 'bg-green-500/10 text-green-400'
                              : `${bg.badge} ${text.muted}`
                          }`}>
                            {f.active_bonuses || 0} active
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => fetchFemaleDetail(f.id)}
                              className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
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
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'rules' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Bonus Rule
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : bonusRules.length === 0 ? (
              <div className={`text-center py-12 ${text.muted}`}>No bonus rules found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${border.default}`}>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Female User</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Offer</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Target</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Progress</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Bonus</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Status</th>
                      <th className={`text-right p-4 text-sm font-semibold ${text.secondary}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusRules.map((r) => (
                      <tr key={r.id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                        <td className="p-4">
                          <div>
                            <p className={`font-medium ${text.primary}`}>{r.female_name || 'Unknown'}</p>
                            <p className={`text-xs ${text.muted}`}>{r.female_phone}</p>
                          </div>
                        </td>
                        <td className={`p-4 ${text.primary}`}>{r.title}</td>
                        <td className={`p-4 ${text.primary}`}>{r.target_minutes} min / {r.validity_days} days</td>
                        <td className="p-4">
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span className={text.muted}>{r.minutes_achieved || 0} / {r.target_minutes}</span>
                              <span className={text.muted}>
                                {Math.min(100, Math.round(((r.minutes_achieved || 0) / r.target_minutes) * 100))}%
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                                style={{ width: `${Math.min(100, ((r.minutes_achieved || 0) / r.target_minutes) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className={`p-4 font-semibold ${text.primary}`}>Rs {r.bonus_amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            r.is_accepted
                              ? r.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {r.is_accepted ? (r.is_active ? 'Active' : 'Completed') : 'Pending Accept'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleRule(r.id, r.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                r.is_active ? 'hover:bg-yellow-500/10 text-yellow-400' : 'hover:bg-green-500/10 text-green-400'
                              }`}
                              title={r.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {r.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteRule(r.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <p className={`text-sm ${text.muted}`}>Page {page} of {totalPages} ({total} rules)</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${bg.pagination}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className={`text-lg font-bold ${text.primary} mb-4`}>Total Revenue</h2>
            <p className={`text-3xl font-bold ${text.primary}`}>
              Rs {Number(revenue?.totalRevenue || 0).toLocaleString()}
            </p>
            <p className={`text-sm ${text.muted} mt-1`}>Total admin revenue from all calls</p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className={`p-4 border-b ${border.default}`}>
              <h2 className={`text-lg font-bold ${text.primary}`}>Monthly Breakdown</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${border.default}`}>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Month</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Female Earned</th>
                      <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Admin Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue?.monthly?.map((m, i) => (
                      <tr key={i} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                        <td className={`p-4 font-medium ${text.primary}`}>{m.month}</td>
                        <td className={`p-4 ${text.primary}`}>Rs {Number(m.female_earned || 0).toLocaleString()}</td>
                        <td className={`p-4 font-semibold text-green-400`}>Rs {Number(m.admin_revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {detailModal.open && detailModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`glass-card p-6 w-full max-w-2xl mx-4 rounded-xl border ${border.default} max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={detailModal.data.user?.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${detailModal.data.user?.name}`}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />
                <div>
                  <h2 className={`text-lg font-bold ${text.primary}`}>{detailModal.data.user?.name}</h2>
                  <p className={`text-sm ${text.muted}`}>{detailModal.data.user?.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModal({ open: false, data: null })}
                className={`p-2 rounded-lg ${bg.hover} ${text.muted}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${bg.card} border ${border.default}`}>
                <p className={`text-sm ${text.muted}`}>Total Minutes</p>
                <p className={`text-xl font-bold ${text.primary}`}>{detailModal.data.user?.total_minutes || 0}</p>
              </div>
              <div className={`p-4 rounded-xl ${bg.card} border ${border.default}`}>
                <p className={`text-sm ${text.muted}`}>Total Earned</p>
                <p className={`text-xl font-bold ${text.primary}`}>Rs {Number(detailModal.data.user?.total_earned || 0).toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-xl ${bg.card} border ${border.default}`}>
                <p className={`text-sm ${text.muted}`}>Wallet Balance</p>
                <p className={`text-xl font-bold ${text.primary}`}>Rs {Number(detailModal.data.user?.wallet_balance || 0).toLocaleString()}</p>
              </div>
            </div>

            {detailModal.data.activeBonuses?.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-semibold ${text.secondary} mb-3`}>ACTIVE BONUS OFFERS</h3>
                <div className="space-y-3">
                  {detailModal.data.activeBonuses.map((b) => (
                    <div key={b.id} className={`p-4 rounded-xl ${bg.card} border ${border.default}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-medium ${text.primary}`}>{b.title}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          b.is_accepted ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {b.is_accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={text.muted}>{b.minutes_achieved || 0} / {b.target_minutes} min</span>
                        <span className={text.muted}>Rs {b.bonus_amount}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          style={{ width: `${Math.min(100, ((b.minutes_achieved || 0) / b.target_minutes) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailModal.data.monthlyBreakdown?.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold ${text.secondary} mb-3`}>MONTHLY BREAKDOWN</h3>
                <div className="space-y-2">
                  {detailModal.data.monthlyBreakdown.map((m, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${bg.hover}`}>
                      <span className={`font-medium ${text.primary}`}>{m.month}</span>
                      <span className={text.muted}>{m.minutes} min</span>
                      <span className={`font-semibold ${text.primary}`}>Rs {Number(m.earned || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {createModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`glass-card p-6 w-full max-w-md mx-4 rounded-xl border ${border.default}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${text.primary}`}>Create Bonus Rule</h2>
              <button
                onClick={() => setCreateModal({ open: false })}
                className={`p-2 rounded-lg ${bg.hover} ${text.muted}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text.secondary} mb-1`}>Female User *</label>
                <select
                  value={createForm.female_user_id}
                  onChange={(e) => setCreateForm({ ...createForm, female_user_id: e.target.value })}
                  className={`input-field w-full`}
                >
                  <option value="">Select female user</option>
                  {femaleList.map((f) => (
                    <option key={f.id} value={f.id}>{f.name || f.phone} ({f.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${text.secondary} mb-1`}>Offer Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className={`input-field w-full`}
                  placeholder="Bonus Offer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text.secondary} mb-1`}>Target Minutes *</label>
                  <input
                    type="number"
                    value={createForm.target_minutes}
                    onChange={(e) => setCreateForm({ ...createForm, target_minutes: e.target.value })}
                    className={`input-field w-full`}
                    placeholder="600"
                    min="1"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text.secondary} mb-1`}>Bonus Amount (Rs) *</label>
                  <input
                    type="number"
                    value={createForm.bonus_amount}
                    onChange={(e) => setCreateForm({ ...createForm, bonus_amount: e.target.value })}
                    className={`input-field w-full`}
                    placeholder="200"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${text.secondary} mb-1`}>Validity (Days)</label>
                <input
                  type="number"
                  value={createForm.validity_days}
                  onChange={(e) => setCreateForm({ ...createForm, validity_days: e.target.value })}
                  className={`input-field w-full`}
                  placeholder="30"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateModal({ open: false })}
                className={`px-4 py-2 rounded-lg ${bg.hover} ${text.muted}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Create & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FemaleEarningsPage;
