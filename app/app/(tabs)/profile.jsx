import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const [wallet, setWallet] = useState({ balance: 0, total_recharged: 0 });
  const [isExpert, setIsExpert] = useState(false);
  const [stats, setStats] = useState({ total_calls: 0, total_spent: 0 });
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const router = useRouter();
  const isFemale = user?.gender === 'female';

  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    try {
      const [walletRes, profileRes] = await Promise.all([
        api.get('/user/wallet').catch(() => ({ data: { data: { balance: 0, total_recharged: 0 } } })),
        api.get('/user/profile').catch(() => ({ data: { data: {} } })),
      ]);
      setWallet(walletRes.data.data || { balance: 0, total_recharged: 0 });
      const profile = profileRes.data.data;
      if (profile && profile.name) {
        updateUser(profile);
      }
      setStats({
        total_calls: profile.total_calls || 0,
        total_spent: profile.total_spent || 0,
      });
      if (isFemale) {
        try {
          const kycRes = await api.get('/kyc/status');
          setKycStatus(kycRes.data.data?.kyc);
        } catch (e) {}
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my profile on ConnectX! ${user?.name} is on ConnectX dating app. Download now!`,
        title: 'Share Profile',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    ...(!isFemale ? [{ icon: 'wallet-outline', label: 'My Wallet', route: '/(modals)/recharge', color: COLORS.primary, badge: `₹${wallet.balance}` }] : []),
    ...(isFemale ? [
      { icon: 'wallet-outline', label: 'My Earnings', route: '/(modals)/withdraw', color: COLORS.success, badge: `₹${wallet.balance}` },
      { icon: 'time-outline', label: 'Withdrawal History', route: '/(modals)/withdraw-history', color: COLORS.textSecondary },
      { icon: 'gift-outline', label: 'Earnings Dashboard', route: '/(modals)/earnings', color: COLORS.primary },
    ] : []),
    ...(isFemale && kycStatus?.verification_status !== 'approved' ? [
      { icon: 'shield-checkmark-outline', label: kycStatus ? `KYC: ${kycStatus.verification_status}` : 'Complete KYC', route: null, color: kycStatus?.verification_status === 'rejected' ? COLORS.error : COLORS.warning },
    ] : []),
    { icon: 'share-social-outline', label: 'Share Profile', route: null, color: COLORS.primary, action: 'share' },
    { icon: 'create-outline', label: 'Edit Profile', route: '/(modals)/edit-profile', color: COLORS.textSecondary },
    { icon: 'images-outline', label: 'Manage Photos', route: '/(modals)/edit-photos', color: COLORS.textSecondary },
    { icon: 'settings-outline', label: 'Settings', route: '/(modals)/settings', color: COLORS.textSecondary },
    { icon: 'ban-outline', label: 'Blocked Users', route: '/(modals)/blocked-users', color: COLORS.textSecondary },
    { icon: 'shield-checkmark-outline', label: 'Safety Tips', route: null, color: COLORS.textSecondary },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null, color: COLORS.textSecondary },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={[COLORS.primary + '15', COLORS.pink]} style={styles.profileCard}>
        <Image source={{ uri: user?.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}` }}
          style={styles.avatar} />
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        {user?.dating_id && (
          <TouchableOpacity style={styles.datingIdRow} onPress={() => Share.share({ message: user.dating_id, title: 'Dating ID' })}>
            <Text style={styles.datingIdText}>{user.dating_id}</Text>
            <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        {user?.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={COLORS.textMuted} />
            <Text style={styles.userLocation}>{user.city}{user.state ? `, ${user.state}` : ''}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(modals)/edit-profile')}>
          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="wallet" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>₹{wallet.balance}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="call" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.total_calls}</Text>
          <Text style={styles.statLabel}>Calls</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>₹{stats.total_spent}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      <View style={styles.expertToggle}>
        <View style={styles.toggleLeft}>
          <Ionicons name="star-outline" size={20} color={COLORS.primary} />
          <View>
            <Text style={styles.toggleLabel}>Become an Expert</Text>
            <Text style={styles.toggleSubtext}>Earn by helping others</Text>
          </View>
        </View>
        <Switch
          value={isExpert}
          onValueChange={setIsExpert}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
          thumbColor={isExpert ? COLORS.primary : COLORS.textMuted}
        />
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index}
            style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
            onPress={() => {
              if (item.action === 'share') { handleShare(); return; }
              if (item.route) router.push(item.route);
              else Alert.alert(item.label, 'Coming soon');
            }}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={22} color={item.color} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.badge && <Text style={styles.menuBadge}>{item.badge}</Text>}
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.poweredBy}>Power By PANKAJ TD BULL</Text>
      <Text style={styles.version}>ConnectX v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  profileCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center',
  },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.border },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.md },
  datingIdRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  datingIdText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  userPhone: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  userLocation: { fontSize: 13, color: COLORS.textMuted },
  editButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm,
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  editText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  expertToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  toggleSubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuCard: {
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  menuBadge: {
    fontSize: 12, fontWeight: '700', color: COLORS.primary,
    backgroundColor: COLORS.pink, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    backgroundColor: COLORS.error + '10', borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg, borderWidth: 1, borderColor: COLORS.error + '20',
  },
  logoutText: { fontSize: 16, color: COLORS.error, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: SPACING.xl },
  poweredBy: { textAlign: 'center', color: COLORS.primary, fontSize: 13, fontWeight: '700', marginTop: SPACING.lg },
});
