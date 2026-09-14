import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { AlertTriangle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const { text, bg, border } = useThemeClasses();

  useEffect(() => { fetchReports(); }, [page, status]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', { params: { page, limit: 20, status } });
      setReports(res.data.data.reports);
      setTotalPages(res.data.data.totalPages);
    } catch (error) { toast.error('Failed to fetch reports'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      toast.success('Report status updated');
      fetchReports();
    } catch (error) { toast.error('Failed to update status'); }
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning_issued: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    dismissed: bg.badge,
  };

  const reasonLabels = {
    fake_profile: 'Fake Profile', inappropriate_content: 'Inappropriate Content',
    harassment: 'Harassment', spam: 'Spam', underage: 'Underage', other: 'Other',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>Reports</h1>
        <p className={text.muted}>Review and manage user reports</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'reviewed', 'warning_issued', 'suspended', 'dismissed'].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${status === s ? 'bg-primary-500 text-white' : `${bg.badge} ${bg.hover}`}`}>
              {s ? s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className={`text-center py-12 ${text.muted}`}>
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reports found</p>
          </div>
        ) : (
          <div className={`divide-y ${border.row}`}>
            {reports.map((report) => (
              <div key={report.id} className={`p-4 ${bg.row} transition-colors`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${text.primary}`}>{report.reporter_name}</span>
                        <span className={text.muted}>reported</span>
                        <span className={`font-medium ${text.primary}`}>{report.reported_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[report.status]}`}>
                          {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`text-xs ${text.faint}`}>Reason: {reasonLabels[report.reason] || report.reason}</span>
                      </div>
                      {report.description && <p className={`text-sm ${text.muted} mt-1`}>"{report.description}"</p>}
                      <p className={`text-xs ${text.faint} mt-1`}>{new Date(report.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleStatusUpdate(report.id, 'warning_issued')}
                        className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm hover:bg-orange-500/20 transition-colors">Warn</button>
                      <button onClick={() => handleStatusUpdate(report.id, 'suspended')}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors">Suspend</button>
                      <button onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${bg.badge} ${bg.hover}`}>Dismiss</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${text.muted}`}>Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className={`p-2 rounded-lg disabled:opacity-50 ${bg.pagination}`}><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className={`p-2 rounded-lg disabled:opacity-50 ${bg.pagination}`}><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
