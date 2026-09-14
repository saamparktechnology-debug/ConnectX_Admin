import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          Alert.alert('Account Deleted', 'Your account has been deleted.');
          await logout();
          router.replace('/(auth)/login');
        } catch (error) {
          Alert.alert('Error', 'Failed to delete account');
        }
      }}
    ]);
  };

  const handleSupportPress = (label) => {
    const messages = {
      'Help Center': 'Email us at support@connectx.com',
      'Terms of Service': 'Terms of service at connectx.live/terms',
      'Privacy Policy': 'Privacy policy at connectx.live/privacy',
      'About ConnectX': 'ConnectX v1.0.0 - 100% Real Friendships',
      'Community Guidelines': 'Be respectful, be real, be safe.',
    };
    Alert.alert(label, messages[label] || 'Coming soon');
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications', label: 'Push Notifications', type: 'toggle', value: notifications, onToggle: setNotifications },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'eye-off', label: 'Anonymous Mode', type: 'toggle', value: anonymousMode, onToggle: setAnonymousMode },
        { icon: 'shield-checkmark', label: 'Blocked Users', type: 'nav', route: '/(modals)/blocked-users' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', type: 'nav', route: '/(modals)/edit-profile' },
        { icon: 'images', label: 'Manage Photos', type: 'nav', route: '/(modals)/edit-photos' },
        { icon: 'wallet', label: 'Recharge Wallet', type: 'nav', route: '/(modals)/recharge' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help Center', type: 'support' },
        { icon: 'document-text', label: 'Terms of Service', type: 'support' },
        { icon: 'lock-closed', label: 'Privacy Policy', type: 'support' },
        { icon: 'book', label: 'Community Guidelines', type: 'support' },
        { icon: 'information-circle', label: 'About ConnectX', type: 'support' },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, gi) => (
          <View key={gi} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, ii) => (
                <TouchableOpacity key={ii}
                  style={[styles.settingsItem, ii === group.items.length - 1 && styles.settingsItemLast]}
                  onPress={() => {
                    if (item.type === 'nav' && item.route) router.push(item.route);
                    else if (item.type === 'support') handleSupportPress(item.label);
                  }}
                  disabled={item.type === 'toggle'}>
                  <View style={styles.settingsLeft}>
                    <Ionicons name={item.icon} size={20} color={COLORS.textSecondary} />
                    <Text style={styles.settingsLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch value={item.value} onValueChange={item.onToggle}
                      trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                      thumbColor={item.value ? COLORS.primary : COLORS.textMuted} />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { paddingBottom: 40 },
  group: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, marginTop: SPACING.lg },
  groupTitle: { fontSize: 13, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '600', marginBottom: 8 },
  groupCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  settingsItemLast: { borderBottomWidth: 0 },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  deleteButton: {
    marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    backgroundColor: COLORS.error + '10', borderRadius: RADIUS.xl,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.error + '20',
  },
  deleteText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
