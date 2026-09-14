import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  completed: 'bg-blue-500/10 text-blue-400',
};

const WithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const { text, bg, border } = useThemeClasses();

  useEffect(() => { fetchWithdrawals(); }, [page, status]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/withdrawals', { params: { page, limit: 20, status } });
      setWithdrawals(res.data.data.withdrawals);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/withdrawals/${id}`, { status: 'approved' });
      toast.success('Withdrawal approved');
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await api.put(`/admin/withdrawals/${rejectModal.id}`, {
        status: 'rejected',
        rejection_reason: rejectModal.reason,
      });
      toast.success('Withdrawal rejected');
      setRejectModal({ open: false, id: null, reason: '' });
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, id, reason: '' });
  };

  const maskAccount = (num) => {
    if (!num) return 'N/A';
    if (num.length <= 4) return num;
    return '****' + num.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>Withdrawals</h1>
        <p className={text.muted}>{total} total withdrawal requests</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-primary-500 text-white'
                : `${bg.hover} ${text.muted} hover:text-primary-400`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className={`text-center py-12 ${text.muted}`}>No withdrawal requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${border.default}`}>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>User</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Amount</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Payment Method</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Account Details</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Status</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Date</th>
                  <th className={`text-right p-4 text-sm font-semibold ${text.secondary}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.user?.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.user?.name}`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        />
                        <div>
                          <p className={`font-medium ${text.primary}`}>{w.user?.name || 'Unknown'}</p>
                          <p className={`text-xs ${text.muted}`}>{w.user?.email || w.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 font-semibold ${text.primary}`}>Rs {Number(w.amount).toLocaleString()}</td>
                    <td className={`p-4 ${text.secondary} capitalize`}>
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4" />
                        {w.payment_method || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      {w.payment_method === 'bank' ? (
                        <div className={`text-sm ${text.muted}`}>
                          <p>{maskAccount(w.account_number)}</p>
                          <p>{w.ifsc || 'N/A'}</p>
                          <p>{w.bank_name || 'N/A'}</p>
                        </div>
                      ) : (
                        <p className={`text-sm ${text.muted}`}>{w.upi_id || 'N/A'}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[w.status] || `${bg.badge} ${text.muted}`}`}>
                        {w.status?.charAt(0).toUpperCase() + w.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className={`p-4 ${text.muted} text-sm`}>
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {w.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(w.id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(w.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
          <p className={`text-sm ${text.muted}`}>Page {page} of {totalPages} ({total} withdrawals)</p>
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

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`glass-card p-6 w-full max-w-md mx-4 rounded-xl border ${border.default}`}>
            <h2 className={`text-lg font-bold ${text.primary} mb-4`}>Reject Withdrawal</h2>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              rows={4}
              className={`input-field w-full resize-none`}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                className={`px-4 py-2 rounded-lg ${bg.hover} ${text.muted}`}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsPage;
