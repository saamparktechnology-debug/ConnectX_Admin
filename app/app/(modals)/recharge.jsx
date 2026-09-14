import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

const rechargeOptions = [
  { amount: 50, bonus: 5, label: '₹50' },
  { amount: 100, bonus: 15, label: '₹100', popular: true },
  { amount: 200, bonus: 40, label: '₹200' },
  { amount: 500, bonus: 125, label: '₹500', popular: true },
  { amount: 1000, bonus: 300, label: '₹1000', best: true },
];

export default function RechargeScreen() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchBalance(); }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/user/wallet');
      setBalance(res.data.data?.balance || 0);
    } catch (error) {
      console.log('Fetch balance error:', error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleRecharge = async () => {
    if (!selectedAmount) return Alert.alert('Error', 'Please select a recharge amount');
    setLoading(true);
    try {
      const res = await api.post('/user/wallet/recharge', { amount: selectedAmount });
      setBalance(res.data.data?.balance || balance + selectedAmount);
      Alert.alert('Success', `₹${selectedAmount} added to your wallet!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to recharge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Recharge Wallet</Text>
        <View style={{ width: 36 }} />
      </View>

      <LinearGradient colors={[COLORS.primary + '15', COLORS.pink]} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        {fetching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.balanceAmount}>₹{balance}.00</Text>
        )}
      </LinearGradient>

      <View style={styles.offerBanner}>
        <Ionicons name="flash" size={20} color={COLORS.warning} />
        <Text style={styles.offerText}>Get extra cashback on all recharges!</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Amount</Text>

      <View style={styles.amountGrid}>
        {rechargeOptions.map((option) => (
          <TouchableOpacity
            key={option.amount}
            style={[
              styles.amountCard,
              selectedAmount === option.amount && styles.amountCardActive,
              option.popular && styles.amountCardPopular,
              option.best && styles.amountCardBest,
            ]}
            onPress={() => setSelectedAmount(option.amount)}
          >
            {option.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>POPULAR</Text></View>}
            {option.best && <View style={styles.bestBadge}><Text style={styles.bestText}>BEST VALUE</Text></View>}
            <Text style={[styles.amountText, selectedAmount === option.amount && styles.amountTextActive]}>
              ₹{option.amount}
            </Text>
            <Text style={styles.bonusText}>+₹{option.bonus} bonus</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleRecharge} activeOpacity={0.8} disabled={loading}>
        <LinearGradient colors={COLORS.gradient.call} style={[styles.payButton, loading && { opacity: 0.6 }]}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.payButtonText}>
              {selectedAmount ? `Pay ₹${selectedAmount}` : 'Select Amount'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Why Recharge?</Text>
        {[
          { icon: 'call', text: 'Make voice calls with experts' },
          { icon: 'chatbubble', text: 'Chat with verified users' },
          { icon: 'shield-checkmark', text: '100% secure payments' },
          { icon: 'gift', text: 'Get bonus on every recharge' },
        ].map((benefit, i) => (
          <View key={i} style={styles.benefitItem}>
            <Ionicons name={benefit.icon} size={18} color={COLORS.primary} />
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  balanceCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: COLORS.textSecondary },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  offerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.lg,
    backgroundColor: COLORS.warning + '15', padding: SPACING.md, borderRadius: RADIUS.lg,
  },
  offerText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  amountGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl,
  },
  amountCard: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  amountCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  amountCardPopular: { borderColor: COLORS.primary },
  amountCardBest: { borderColor: COLORS.warning },
  popularBadge: {
    position: 'absolute', top: -10, backgroundColor: COLORS.primary,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  popularText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  bestBadge: {
    position: 'absolute', top: -10, backgroundColor: COLORS.warning,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  bestText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  amountText: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  amountTextActive: { color: COLORS.primary },
  bonusText: { fontSize: 12, color: COLORS.success, fontWeight: '600', marginTop: 4 },
  payButton: {
    marginHorizontal: SPACING.lg, height: 56, borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  payButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  benefits: {
    marginHorizontal: SPACING.lg, marginTop: SPACING.xl,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  benefitsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  benefitText: { fontSize: 14, color: COLORS.textSecondary },
});
