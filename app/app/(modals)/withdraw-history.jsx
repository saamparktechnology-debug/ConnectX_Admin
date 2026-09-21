import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

const STATUS_CONFIG = {
  pending: { color: COLORS.warning, bg: COLORS.warning + '20', label: 'Pending' },
  approved: { color: COLORS.success, bg: COLORS.successLight, label: 'Approved' },
  rejected: { color: COLORS.error, bg: COLORS.error + '20', label: 'Rejected' },
  completed: { color: '#007AFF', bg: '#007AFF' + '20', label: 'Completed' },
};

export default function WithdrawHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/withdrawal/history');
      setHistory(res.data.data || []);
    } catch (error) {
      console.log('Fetch withdrawal history error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isBank = item.method === 'bank';
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.methodRow}>
            <View style={[styles.methodIcon, { backgroundColor: isBank ? COLORS.primary + '15' : '#6C63FF' + '15' }]}>
              <Ionicons
                name={isBank ? 'business' : 'phone-portrait'}
                size={18}
                color={isBank ? COLORS.primary : '#6C63FF'}
              />
            </View>
            <View>
              <Text style={styles.methodLabel}>{isBank ? 'Bank Transfer' : 'UPI'}</Text>
              <Text style={styles.methodDetail}>
                {isBank ? item.bankName || 'Bank Account' : item.upiId}
              </Text>
            </View>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <View style={styles.cardAmount}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>₹{item.amount}</Text>
        </View>

        {isBank && item.accountNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account No.</Text>
            <Text style={styles.detailValue}>••••{item.accountNumber.slice(-4)}</Text>
          </View>
        )}

        {item.ifscCode && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IFSC</Text>
            <Text style={styles.detailValue}>{item.ifscCode}</Text>
          </View>
        )}

        {item.accountHolderName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Holder</Text>
            <Text style={styles.detailValue}>{item.accountHolderName}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.dateText}>{formatDate(item.createdAt || item.date)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.dateText}>{formatTime(item.createdAt || item.date)}</Text>
          </View>
        </View>

        {item.rejectionReason && (
          <View style={styles.rejectionBox}>
            <Ionicons name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="wallet-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Withdrawals Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your withdrawal history will appear here once you make a request.
      </Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
        <Text style={styles.goBackButtonText}>Make a Withdrawal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 44 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Withdrawal History</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={history.length === 0 ? styles.emptyList : styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, fontSize: 14, color: COLORS.textSecondary },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  emptyList: { flexGrow: 1 },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xxl, paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptySubtitle: {
    fontSize: 14, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: SPACING.xl,
  },
  goBackButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.full,
  },
  goBackButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  historyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodIcon: {
    width: 38, height: 38, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  methodDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardAmount: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  amountLabel: { fontSize: 13, color: COLORS.textSecondary },
  amountValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 13, color: COLORS.textMuted },
  detailValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  rejectionBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SPACING.md, backgroundColor: COLORS.error + '10',
    padding: SPACING.md, borderRadius: RADIUS.md,
  },
  rejectionText: { fontSize: 12, color: COLORS.error, flex: 1 },
});
