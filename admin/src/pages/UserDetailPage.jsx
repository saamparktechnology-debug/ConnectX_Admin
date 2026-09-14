import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { ArrowLeft, Shield, Ban, CheckCircle, Heart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { text, bg, border } = useThemeClasses();

  useEffect(() => { fetchUser(); }, [userId]);

  const fetchUser = async () => {
    try { const res = await api.get(`/admin/users/${userId}`); setUser(res.data.data); }
    catch (error) { toast.error('Failed to load user'); navigate('/users'); }
    finally { setLoading(false); }
  };

  const handleBan = async () => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { banned: !user.is_banned });
      setUser({ ...user, is_banned: !user.is_banned });
      toast.success(user.is_banned ? 'User unbanned' : 'User banned');
    } catch (error) { toast.error('Action failed'); }
  };

  const handleVerify = async () => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { verified: !user.is_verified });
      setUser({ ...user, is_verified: !user.is_verified });
      toast.success(user.is_verified ? 'Verification removed' : 'User verified');
    } catch (error) { toast.error('Action failed'); }
  };

  const handleDeactivate = async () => {
    try {
      await api.put(`/admin/users/${userId}/deactivate`, { deactivated: !user.is_deactivated });
      setUser({ ...user, is_deactivated: !user.is_deactivated });
      toast.success(user.is_deactivated ? 'User reactivated' : 'User deactivated');
    } catch (error) { toast.error('Action failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  const photos = Array.isArray(user.photos) ? user.photos : (user.photos ? user.photos.split(',') : []);
  const interests = Array.isArray(user.interests) ? user.interests : (user.interests ? user.interests.split(',') : []);
  const age = user.date_of_birth ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/users')} className={`flex items-center gap-2 transition-colors ${text.muted} hover:${text.primary}`}>
        <ArrowLeft className="w-5 h-5" /> Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6">
            <div className="text-center">
              <img src={photos[selectedPhoto] || user.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt="" className="w-32 h-32 rounded-2xl object-cover mx-auto bg-gray-200" />
              <h2 className={`text-xl font-bold mt-4 ${text.primary}`}>{user.name}, {age}</h2>
              <p className={text.muted}>{user.city || 'Unknown location'}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {user.is_verified ? <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full"><Shield className="w-3 h-3" /> Verified</span> : null}
                {user.is_premium ? <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full"><Heart className="w-3 h-3" /> Premium</span> : null}
                {user.is_banned ? <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full"><Ban className="w-3 h-3" /> Banned</span> : null}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {photos.map((photo, i) => (
                <button key={i} onClick={() => setSelectedPhoto(i)}
                  className={`rounded-lg overflow-hidden aspect-square ${selectedPhoto === i ? 'ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className={`text-lg font-semibold mb-4 ${text.primary}`}>Actions</h3>
            <div className="space-y-2">
              <button onClick={handleVerify}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${user.is_verified ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : `${bg.badge} ${bg.hover}`}`}>
                <CheckCircle className="w-5 h-5" />{user.is_verified ? 'Remove Verification' : 'Verify User'}
              </button>
              <button onClick={handleBan}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${user.is_banned ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : `${bg.badge} ${bg.hover}`}`}>
                <Ban className="w-5 h-5" />{user.is_banned ? 'Unban User' : 'Ban User'}
              </button>
              <button onClick={handleDeactivate}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${user.is_deactivated ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : `${bg.badge} ${bg.hover}`}`}>
                <Eye className="w-5 h-5" />{user.is_deactivated ? 'Reactivate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h3 className={`text-lg font-semibold mb-4 ${text.primary}`}>Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Email', value: user.email || 'Not provided' },
                { label: 'Phone', value: user.phone || 'Not provided' },
                { label: 'Gender', value: user.gender || 'Not specified' },
                { label: 'Date of Birth', value: user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not specified' },
                { label: 'Looking For', value: user.looking_for || 'Not specified' },
                { label: 'Relationship Goal', value: user.relationship_goal?.replace('_', ' ') || 'Not specified' },
                { label: 'Occupation', value: user.occupation || 'Not specified' },
                { label: 'Height', value: user.height ? `${user.height} cm` : 'Not specified' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className={`text-sm ${text.muted}`}>{label}</p>
                  <p className={`capitalize ${text.primary}`}>{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className={`text-sm ${text.muted}`}>Bio</p>
                <p className={text.primary}>{user.bio || 'No bio'}</p>
              </div>
            </div>
          </div>

          {interests.length > 0 && (
            <div className="glass-card p-6">
              <h3 className={`text-lg font-semibold mb-4 ${text.primary}`}>Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-sm rounded-full border border-primary-500/20">{interest}</span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className={`text-lg font-semibold mb-4 ${text.primary}`}>Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${text.muted}`}>Joined</p>
                <p className={text.primary}>{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className={`text-sm ${text.muted}`}>Last Active</p>
                <p className={text.primary}>{user.last_active ? new Date(user.last_active).toLocaleString() : 'Unknown'}</p>
              </div>
              <div>
                <p className={`text-sm ${text.muted}`}>Premium Expiry</p>
                <p className={text.primary}>{user.premium_expiry ? new Date(user.premium_expiry).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${text.muted}`}>Language</p>
                <p className={text.primary}>{user.language || 'English'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
