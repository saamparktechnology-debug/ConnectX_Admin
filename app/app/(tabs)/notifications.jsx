import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { COLORS } from '../../utils/constants';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id, index) => {
    try {
      if (notifications[index].is_read) return;
      const res = await api.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        const newNotifs = [...notifications];
        newNotifs[index].is_read = 1;
        setNotifications(newNotifs);
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => markAsRead(item.id, index)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconEmoji}>{item.type === 'bonus' ? '🎁' : '🔔'}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginHorizontal: 20, marginVertical: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    backgroundColor: '#fff5f7', 
    borderColor: '#ffd6e0'
  },
  iconContainer: {
    width: 45, height: 45, borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  iconEmoji: { fontSize: 22 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  unreadText: { fontWeight: '700', color: COLORS.primary },
  message: { fontSize: 14, color: COLORS.textMuted, marginBottom: 6 },
  time: { fontSize: 11, color: '#aaa' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginLeft: 10 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
});
