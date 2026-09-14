import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function RecentsScreen() {
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchRecents(); }, []);

  const fetchRecents = async () => {
    try {
      const res = await api.get('/user/recent-calls');
      setRecents(res.data.data?.recents || []);
    } catch (error) {
      console.log('Fetch recents error:', error.message);
      setRecents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecents();
    setRefreshing(false);
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ended': return COLORS.textMuted;
      case 'connected': return COLORS.success;
      case 'missed': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const renderRecent = ({ item }) => (
    <View style={styles.recentItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.primary_photo || item.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}` }} style={styles.avatar} />
        {item.is_online ? <View style={styles.onlineDot} /> : <View style={styles.offlineDot} />}
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentName}>{item.name}</Text>
        <View style={styles.recentMeta}>
          <Text style={[styles.recentStatus, { color: getStatusColor(item.status) }]}>{item.status || 'ended'}</Text>
          <Text style={styles.recentDot}>·</Text>
          <Text style={styles.recentTime}>{formatDate(item.started_at || item.called_at)}</Text>
        </View>
        {item.category && <Text style={styles.recentCategory}>{item.category}</Text>}
      </View>
      <View style={styles.recentRight}>
        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        <Text style={styles.cost}>₹{item.cost || 0}</Text>
        <TouchableOpacity
          style={styles.callbackButton}
          onPress={() => router.push(`/(modals)/call?expertId=${item.expert_id}&name=${item.name}&photo=${item.primary_photo || item.photo || ''}&price=${item.price_per_minute || 5}`)}
        >
          <Ionicons name="call" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Calls</Text>
        <Text style={styles.count}>{recents.length} calls</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />
      ) : recents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="call-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No recent calls</Text>
          <Text style={styles.emptySubtext}>Your call history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={recents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecent}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 50, paddingBottom: SPACING.md,
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  count: { fontSize: 13, color: COLORS.textMuted },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.border },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.white,
  },
  offlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.textMuted, borderWidth: 2, borderColor: COLORS.white,
  },
  recentInfo: { flex: 1, marginLeft: 12 },
  recentName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  recentStatus: { fontSize: 12, fontWeight: '500' },
  recentDot: { fontSize: 12, color: COLORS.textMuted },
  recentTime: { fontSize: 12, color: COLORS.textMuted },
  recentCategory: {
    fontSize: 11, color: COLORS.primary, fontWeight: '500',
    backgroundColor: COLORS.pink, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: RADIUS.full, marginTop: 4, alignSelf: 'flex-start',
  },
  recentRight: { alignItems: 'flex-end', gap: 4 },
  duration: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  cost: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  callbackButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.pink,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted },
});
