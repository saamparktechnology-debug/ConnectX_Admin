import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { text, bg } = useThemeClasses();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await api.get('/admin/settings'); setSettings(res.data.data.settings); }
    catch (error) { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleChange = (key, value) => {
    setSettings(settings.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(settings.map(s => api.put(`/admin/settings/${s.setting_key}`, { value: s.setting_value })));
      toast.success('Settings saved successfully');
    } catch (error) { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const settingGroups = {
    'Age Settings': ['min_age', 'max_age'],
    'Distance Settings': ['max_distance'],
    'Swipe Limits': ['daily_like_limit', 'daily_super_like_limit'],
    'Profile Rules': ['max_photos', 'min_photos', 'min_bio_length'],
    'Safety': ['report_threshold', 'min_swipe_age'],
    'Chat': ['match_expiry_hours', 'typing_timeout'],
    'Voice Rooms': ['voice_room_max_members'],
    'Online Status': ['online_threshold'],
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
          <h1 className={`text-2xl font-bold ${text.primary}`}>Settings</h1>
          <p className={text.muted}>Configure your Connecto app</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(settingGroups).map(([groupName, keys]) => (
          <div key={groupName} className="glass-card p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${text.primary}`}>
              <SettingsIcon className="w-5 h-5 text-primary-400" />
              {groupName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {keys.map(key => {
                const setting = settings.find(s => s.setting_key === key);
                if (!setting) return null;
                return (
                  <div key={key}>
                    <label className={`block text-sm mb-1 ${text.secondary}`}>{setting.description || setting.setting_key}</label>
                    <input type={setting.setting_type === 'number' ? 'number' : 'text'}
                      value={setting.setting_value || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="input-field w-full" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
