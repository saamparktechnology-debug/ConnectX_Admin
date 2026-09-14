import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { Save, CreditCard, Building2, Smartphone, Hash, User } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentSettingsPage = () => {
  const [settings, setSettings] = useState({
    payment_upi_id: '', payment_bank_name: '', payment_account_number: '',
    payment_ifsc_code: '', payment_account_holder: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { text } = useThemeClasses();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/payment-settings');
      const data = res.data.data.settings;
      const mapped = {};
      data.forEach(s => { mapped[s.setting_key] = s.setting_value || ''; });
      setSettings(prev => ({ ...prev, ...mapped }));
    } catch (error) { toast.error('Failed to load payment settings'); }
    finally { setLoading(false); }
  };

  const handleChange = (key, value) => { setSettings(prev => ({ ...prev, [key]: value })); };

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/admin/payment-settings', settings); toast.success('Payment settings saved successfully'); }
    catch (error) { toast.error('Failed to save payment settings'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${text.primary}`}>Payment Settings</h1>
          <p className={text.muted}>Manage UPI and bank account details for payments</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${text.primary}`}>
            <Smartphone className="w-5 h-5 text-primary-400" />
            UPI Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${text.secondary}`}>UPI ID</label>
              <div className="relative">
                <Smartphone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${text.muted}`} />
                <input type="text" value={settings.payment_upi_id} onChange={(e) => handleChange('payment_upi_id', e.target.value)}
                  placeholder="e.g. name@upi" className="input-field w-full pl-10" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${text.primary}`}>
            <Building2 className="w-5 h-5 text-primary-400" />
            Bank Account Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${text.secondary}`}>Account Holder Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${text.muted}`} />
                <input type="text" value={settings.payment_account_holder} onChange={(e) => handleChange('payment_account_holder', e.target.value)}
                  placeholder="Full name as per bank" className="input-field w-full pl-10" />
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${text.secondary}`}>Bank Name</label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${text.muted}`} />
                <input type="text" value={settings.payment_bank_name} onChange={(e) => handleChange('payment_bank_name', e.target.value)}
                  placeholder="e.g. State Bank of India" className="input-field w-full pl-10" />
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${text.secondary}`}>Account Number</label>
              <div className="relative">
                <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${text.muted}`} />
                <input type="text" value={settings.payment_account_number} onChange={(e) => handleChange('payment_account_number', e.target.value)}
                  placeholder="Bank account number" className="input-field w-full pl-10" />
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${text.secondary}`}>IFSC Code</label>
              <div className="relative">
                <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${text.muted}`} />
                <input type="text" value={settings.payment_ifsc_code} onChange={(e) => handleChange('payment_ifsc_code', e.target.value)}
                  placeholder="e.g. SBIN0001234" className="input-field w-full pl-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
