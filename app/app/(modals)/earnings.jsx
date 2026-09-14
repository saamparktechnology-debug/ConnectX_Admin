import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState(null);
  const [bonuses, setBonuses] = useState({ activeBonuses: [], pendingOffers: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [earningsRes, bonusesRes] = await Promise.all([
        api.get('/female/earnings'),
        api.get('/female/bonus-rules'),
      ]);
      setEarnings(earningsRes.data.data);
      setBonuses(bonusesRes.data.data);
    } catch (error) {
      console.log('Fetch earnings error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (ruleId) => {
    Alert.alert('Accept Offer', 'Are you sure you want to accept this bonus offer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await api.post(`/female/bonus-rules/${ruleId}/accept`);
            Alert.alert('Success', 'Bonus offer accepted! Start talking to earn bonus.');
            fetchData();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to accept offer');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const user = earnings?.user;
  const totalMinutes = user?.total_minutes || 0;
  const totalEarned = user?.total_earned || 0;
  const walletBalance = user?.wallet_balance || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      <LinearGradient colors={[COLORS.success + '20', COLORS.primary + '10']} style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{totalEarned.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{walletBalance.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </LinearGradient>

      {bonuses.pendingOffers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Bonus Offers</Text>
          {bonuses.pendingOffers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Ionicons name="gift" size={20} color={COLORS.primary} />
                <Text style={styles.offerTitle}>{offer.title}</Text>
              </View>
              <Text style={styles.offerDesc}>
                Talk for {offer.target_minutes} minutes in {offer.validity_days} days and earn ₹{offer.bonus_amount} bonus!
              </Text>
              <Text style={styles.offerDeadline}>
                Expires: {new Date(offer.end_date).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOffer(offer.id)}
              >
                <Text style={styles.acceptButtonText}>Accept Offer</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {bonuses.activeBonuses?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Bonus Progress</Text>
          {bonuses.activeBonuses.map((bonus) => {
            const progress = Math.min(100, Math.round(((bonus.minutes_achieved || 0) / bonus.target_minutes) * 100));
            return (
              <View key={bonus.id} style={styles.bonusCard}>
                <View style={styles.bonusHeader}>
                  <Text style={styles.bonusTitle}>{bonus.title}</Text>
                  <Text style={styles.bonusAmount}>₹{bonus.bonus_amount}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.bonusFooter}>
                  <Text style={styles.bonusProgress}>
                    {bonus.minutes_achieved || 0} / {bonus.target_minutes} min
                  </Text>
                  <Text style={styles.bonusPercent}>{progress}%</Text>
                </View>
                <Text style={styles.bonusDeadline}>
                  Expires: {new Date(bonus.end_date).toLocaleDateString()}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {earnings?.monthlyBreakdown?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Earnings</Text>
          {earnings.monthlyBreakdown.map((m, i) => (
            <View key={i} style={styles.monthRow}>
              <Text style={styles.monthLabel}>{m.month}</Text>
              <Text style={styles.monthMinutes}>{m.minutes} min</Text>
              <Text style={styles.monthEarned}>₹{Number(m.earned || 0).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.withdrawButton} onPress={() => router.push('/(modals)/withdraw')}>
        <Ionicons name="wallet" size={20} color={COLORS.white} />
        <Text style={styles.withdrawButtonText}>Withdraw Balance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 100 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  statsCard: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl,
    padding: SPACING.lg, justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  section: { marginTop: SPACING.lg, marginHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  offerCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.primary + '30', marginBottom: SPACING.sm,
  },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  offerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  offerDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  offerDeadline: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  acceptButton: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: 10, alignItems: 'center', marginTop: 12,
  },
  acceptButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  bonusCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm,
  },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bonusTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bonusAmount: { fontSize: 16, fontWeight: '800', color: COLORS.success },
  progressBar: {
    height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.primary, borderRadius: 4,
  },
  bonusFooter: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  bonusProgress: { fontSize: 12, color: COLORS.textMuted },
  bonusPercent: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  bonusDeadline: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  monthLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  monthMinutes: { fontSize: 13, color: COLORS.textMuted, flex: 1, textAlign: 'center' },
  monthEarned: { fontSize: 14, fontWeight: '700', color: COLORS.success, flex: 1, textAlign: 'right' },
  withdrawButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    backgroundColor: COLORS.success, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
  },
  withdrawButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
