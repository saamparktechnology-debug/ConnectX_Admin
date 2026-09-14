import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const SERVER_URL = 'https://connecto-server-jzev.onrender.com';

const filterTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const { isDark, text, bg, border } = useThemeClasses();

  const statusStyles = {
    pending: isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
    approved: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600',
    rejected: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600',
  };

  useEffect(() => { fetchVerifications(); }, [page, status]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verifications', { params: { page, limit: 20, status } });
      setVerifications(res.data.data.verifications);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/verifications/${userId}`, { status: 'approved' });
      toast.success('Verification approved');
      fetchVerifications();
      setSelected(null);
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(userId);
    try {
      await api.put(`/admin/verifications/${userId}`, { status: 'rejected', rejection_reason: rejectReason.trim() });
      toast.success('Verification rejected');
      fetchVerifications();
      setSelected(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>KYC Verifications</h1>
        <p className={text.muted}>{total} total verifications</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-primary-500 text-white'
                : `${bg.pagination} ${text.secondary} hover:bg-primary-500/20`
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
        ) : verifications.length === 0 ? (
          <div className={`text-center py-12 ${text.muted}`}>No verifications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${border.default}`}>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>User</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Aadhar Number</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>PAN Number</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Bank/UPI</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Voice Note</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Status</th>
                  <th className={`text-right p-4 text-sm font-semibold ${text.secondary}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.user_id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.name}`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        />
                        <div>
                          <p className={`font-medium ${text.primary}`}>{v.name}</p>
                          <p className={`text-xs ${text.muted}`}>{v.email || v.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${text.secondary} text-sm`}>{v.aadhar_number || '-'}</td>
                    <td className={`p-4 ${text.secondary} text-sm`}>{v.pan_number || '-'}</td>
                    <td className={`p-4 ${text.secondary} text-sm`}>
                      {v.bank_account_number ? (
                        <div>
                          <p>{v.bank_account_number}</p>
                          {v.bank_ifsc && <p className="text-xs">{v.bank_ifsc} ({v.bank_name || ''})</p>}
                          {v.bank_holder_name && <p className="text-xs">Holder: {v.bank_holder_name}</p>}
                        </div>
                      ) : v.upi_id ? (
                        <p>{v.upi_id}</p>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {v.voice_note_url ? (
                        <audio controls preload="none" className="h-8 min-w-[160px]">
                          <source src={v.voice_note_url.startsWith('http') ? v.voice_note_url : `${SERVER_URL}${v.voice_note_url}`} type="audio/mpeg" />
                        </audio>
                      ) : (
                        <span className={`text-sm ${text.muted}`}>-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[v.verification_status] || ''}`}>
                        {v.verification_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelected(v); setRejectReason(''); }}
                          className={`p-2 rounded-lg ${bg.hover} ${text.muted} hover:text-primary-400 transition-colors`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {v.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(v.user_id)}
                              disabled={actionLoading === v.user_id}
                              className={`p-2 rounded-lg transition-colors hover:bg-green-500/10 text-green-400 disabled:opacity-50`}
                            >
                              {actionLoading === v.user_id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSelected(v); setRejectReason(''); }}
                              disabled={actionLoading === v.user_id}
                              className={`p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 disabled:opacity-50`}
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
          <p className={`text-sm ${text.muted}`}>Page {page} of {totalPages} ({total} verifications)</p>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto ${bg.row}`}>
            <div className={`flex items-center justify-between p-5 border-b ${border.default}`}>
              <h2 className={`text-lg font-bold ${text.primary}`}>KYC Details</h2>
              <button onClick={() => setSelected(null)} className={`p-1 rounded-lg ${bg.hover} ${text.muted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={selected.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.name}`}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover bg-gray-200"
                />
                <div>
                  <p className={`text-lg font-semibold ${text.primary}`}>{selected.name}</p>
                  <p className={`text-sm ${text.muted}`}>{selected.email || selected.phone}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${statusStyles[selected.verification_status] || ''}`}>
                    {selected.verification_status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow label="Aadhar Number" value={selected.aadhar_number} text={text} border={border} />
                <DetailRow label="PAN Number" value={selected.pan_number} text={text} border={border} />
                <DetailRow label="Bank Account" value={selected.bank_account_number} text={text} border={border} />
                <DetailRow label="Bank IFSC" value={selected.bank_ifsc} text={text} border={border} />
                <DetailRow label="Bank Name" value={selected.bank_name} text={text} border={border} />
                <DetailRow label="Bank Holder" value={selected.bank_holder_name} text={text} border={border} />
                <DetailRow label="UPI ID" value={selected.upi_id} text={text} border={border} />
                <DetailRow label="Submitted At" value={selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'} text={text} border={border} />
              </div>

              {selected.voice_note_url && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${text.secondary}`}>Voice Note</p>
                  <audio controls preload="none" className="w-full">
                    <source src={selected.voice_note_url.startsWith('http') ? selected.voice_note_url : `${SERVER_URL}${selected.voice_note_url}`} type="audio/mpeg" />
                  </audio>
                </div>
              )}

              {selected.verification_status === 'rejected' && selected.rejection_reason && (
                <div className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20`}>
                  <p className="text-sm font-medium text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-300">{selected.rejection_reason}</p>
                </div>
              )}

              {selected.verification_status === 'pending' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className={`text-sm font-medium ${text.secondary} block mb-1`}>Rejection Reason</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="input-field w-full"
                      placeholder="Enter reason if rejecting..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selected.user_id)}
                      disabled={actionLoading === selected.user_id}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
                    >
                      {actionLoading === selected.user_id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selected.user_id)}
                      disabled={actionLoading === selected.user_id}
                      className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === selected.user_id ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value, text, border }) => (
  <div className={`flex justify-between items-center py-2 border-b ${border.row}`}>
    <span className={`text-sm font-medium ${text.secondary}`}>{label}</span>
    <span className={`text-sm ${text.primary}`}>{value || '-'}</span>
  </div>
);

export default VerificationsPage;
