import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { text, bg, border } = useThemeClasses();

  useEffect(() => { fetchSubscriptions(); }, [page]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscriptions', { params: { page, limit: 20 } });
      setSubscriptions(res.data.data.subscriptions);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (error) { console.error('Fetch subscriptions error:', error); }
    finally { setLoading(false); }
  };

  const statusColors = {
    completed: 'bg-green-500/10 text-green-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    failed: 'bg-red-500/10 text-red-400',
    refunded: 'bg-orange-500/10 text-orange-400',
    cancelled: bg.badge,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${text.primary}`}>Subscriptions</h1>
        <p className={text.muted}>{total} total subscriptions</p>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className={`text-center py-12 ${text.muted}`}>No subscriptions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${border.default}`}>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>User</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Plan</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Amount</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Status</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>Start Date</th>
                  <th className={`text-left p-4 text-sm font-semibold ${text.secondary}`}>End Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className={`border-b ${border.row} ${bg.row} transition-colors`}>
                    <td className="p-4">
                      <div>
                        <p className={`font-medium ${text.primary}`}>{sub.user_name}</p>
                        <p className={`text-xs ${text.muted}`}>{sub.user_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-sm rounded-full">{sub.plan_name}</span>
                    </td>
                    <td className={`p-4 ${text.primary}`}>₹{sub.amount_paid}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[sub.payment_status]}`}>{sub.payment_status}</span>
                    </td>
                    <td className={`p-4 ${text.secondary} text-sm`}>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td className={`p-4 ${text.secondary} text-sm`}>{new Date(sub.end_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default SubscriptionsPage;
