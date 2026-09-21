import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function BlockedUsersScreen() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchBlocked(); }, []);

  const fetchBlocked = async () => {
    try {
      const res = await api.get('/user/blocked');
      setBlocked(res.data.data.blockedUsers || []);
    } catch (error) {
      console.log('Fetch blocked error:', error);
    } finally { setLoading(false); }
  };

  const handleUnblock = async (userId, userName) => {
    Alert.alert('Unblock User', `Unblock ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unblock', onPress: async () => {
        try {
          await api.post('/user/unblock', { blockedId: userId });
          setBlocked(blocked.filter(u => u.id !== userId));
          Alert.alert('Success', `${userName} has been unblocked`);
        } catch (error) { Alert.alert('Error', 'Failed to unblock'); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 44 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />
      ) : blocked.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="ban-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No blocked users</Text>
          <Text style={styles.emptySubtext}>You haven't blocked anyone</Text>
        </View>
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.blockItem}>
              <Image source={{ uri: item.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}` }}
                style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userCity}>{item.city || ''}</Text>
              </View>
              <TouchableOpacity onPress={() => handleUnblock(item.id, item.name)} style={styles.unblockButton}>
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  blockItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.border },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  userCity: { fontSize: 12, color: COLORS.textMuted },
  unblockButton: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full,
  },
  unblockText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
});
