import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { Plus, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { text, bg } = useThemeClasses();
  const [formData, setFormData] = useState({
    name: '', description: '', duration_days: 30, price: '',
    swipe_limit: '', super_like_limit: '', boost_available: false,
    see_who_liked: false, unlimited_likes: false, display_order: 0
  });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try { const res = await api.get('/admin/plans'); setPlans(res.data.data.plans); }
    catch (error) { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ name: plan.name, description: plan.description || '', duration_days: plan.duration_days, price: plan.price,
        swipe_limit: plan.swipe_limit || '', super_like_limit: plan.super_like_limit || '',
        boost_available: plan.boost_available, see_who_liked: plan.see_who_liked,
        unlimited_likes: plan.unlimited_likes, display_order: plan.display_order || 0 });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', description: '', duration_days: 30, price: '', swipe_limit: '', super_like_limit: '',
        boost_available: false, see_who_liked: false, unlimited_likes: false, display_order: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) { await api.put(`/admin/plans/${editingPlan.id}`, formData); toast.success('Plan updated'); }
      else { await api.post('/admin/plans', formData); toast.success('Plan created'); }
      setShowModal(false); fetchPlans();
    } catch (error) { toast.error('Failed to save plan'); }
  };

  const handleToggleActive = async (plan) => {
    try {
      await api.put(`/admin/plans/${plan.id}`, { is_active: !plan.is_active });
      toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated'); fetchPlans();
    } catch (error) { toast.error('Failed to update plan'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${text.primary}`}>Premium Plans</h1>
          <p className={text.muted}>Manage subscription plans</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass-card p-6 ${!plan.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${text.primary}`}>{plan.name}</h3>
                  <p className="text-3xl font-bold gradient-text mt-1">₹{plan.price}</p>
                  <p className={`${text.muted} text-sm`}>{plan.duration_days} days</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${plan.is_active ? 'bg-green-500/10 text-green-400' : bg.badge}`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {plan.unlimited_likes && <p className={`text-sm ${text.secondary} flex items-center gap-2`}><span className="text-green-400">✓</span> Unlimited Likes</p>}
                {plan.see_who_liked && <p className={`text-sm ${text.secondary} flex items-center gap-2`}><span className="text-green-400">✓</span> See Who Liked You</p>}
                {plan.boost_available && <p className={`text-sm ${text.secondary} flex items-center gap-2`}><span className="text-green-400">✓</span> Profile Boost</p>}
                {plan.swipe_limit && <p className={`text-sm ${text.secondary} flex items-center gap-2`}><span className="text-green-400">✓</span> {plan.swipe_limit} Extra Swipes</p>}
                {plan.super_like_limit && <p className={`text-sm ${text.secondary} flex items-center gap-2`}><span className="text-green-400">✓</span> {plan.super_like_limit} Super Likes</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(plan)} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm transition-colors ${bg.badge} ${bg.hover}`}>
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleToggleActive(plan)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm transition-colors ${plan.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${text.primary}`}>{editingPlan ? 'Edit Plan' : 'Add Plan'}</h2>
              <button onClick={() => setShowModal(false)} className={text.muted}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${text.secondary}`}>Plan Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field w-full" placeholder="e.g., Connecto Plus" />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${text.secondary}`}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field w-full h-20" placeholder="Plan description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${text.secondary}`}>Duration (days)</label>
                  <input type="number" value={formData.duration_days} onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})} className="input-field w-full" />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${text.secondary}`}>Price (₹)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field w-full" placeholder="299" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${text.secondary}`}>Extra Swipe Limit</label>
                  <input type="number" value={formData.swipe_limit} onChange={(e) => setFormData({...formData, swipe_limit: e.target.value})} className="input-field w-full" placeholder="Leave empty for unlimited" />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${text.secondary}`}>Super Like Limit</label>
                  <input type="number" value={formData.super_like_limit} onChange={(e) => setFormData({...formData, super_like_limit: e.target.value})} className="input-field w-full" placeholder="Leave empty for unlimited" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'unlimited_likes', label: 'Unlimited Likes' },
                  { key: 'see_who_liked', label: 'See Who Liked You' },
                  { key: 'boost_available', label: 'Profile Boost Available' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.checked})} className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                    <span className={text.secondary}>{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} className="btn-primary flex-1">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
