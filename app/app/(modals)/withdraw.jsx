import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function WithdrawScreen() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState(100);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [upiId, setUpiId] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchEarnings();
    fetchSettings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/withdrawal/earnings');
      setEarnings(res.data.data);
    } catch (error) {
      console.log('Fetch earnings error:', error.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      const settings = res.data.data;
      if (settings?.minimumWithdrawal) {
        setMinWithdrawal(settings.minimumWithdrawal);
      }
    } catch (error) {
      console.log('Fetch settings error:', error.message);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < minWithdrawal) {
      return Alert.alert('Error', `Minimum withdrawal amount is ₹${minWithdrawal}`);
    }

    if (withdrawAmount > (earnings?.availableBalance || 0)) {
      return Alert.alert('Error', 'Insufficient balance for this withdrawal');
    }

    if (paymentMethod === 'bank') {
      if (!bankName.trim()) return Alert.alert('Error', 'Please enter bank name');
      if (!accountNumber.trim()) return Alert.alert('Error', 'Please enter account number');
      if (accountNumber !== confirmAccount) return Alert.alert('Error', 'Account numbers do not match');
      if (!ifscCode.trim()) return Alert.alert('Error', 'Please enter IFSC code');
      if (!accountHolder.trim()) return Alert.alert('Error', 'Please enter account holder name');
    } else {
      if (!upiId.trim()) return Alert.alert('Error', 'Please enter UPI ID');
    }

    setLoading(true);
    try {
      const payload = {
        amount: withdrawAmount,
        method: paymentMethod,
        ...(paymentMethod === 'bank'
          ? { bankName, accountNumber, ifscCode, accountHolderName: accountHolder }
          : { upiId }),
      };

      await api.post('/withdrawal/request', payload);

      Alert.alert('Success', 'Your withdrawal request has been submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit withdrawal request. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderBankFields = () => (
    <View style={styles.fieldsContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Enter bank name"
            placeholderTextColor={COLORS.textMuted}
            value={bankName}
            onChangeText={setBankName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Enter account holder name"
            placeholderTextColor={COLORS.textMuted}
            value={accountHolder}
            onChangeText={setAccountHolder}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            placeholderTextColor={COLORS.textMuted}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Account Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter account number"
            placeholderTextColor={COLORS.textMuted}
            value={confirmAccount}
            onChangeText={setConfirmAccount}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="code-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Enter IFSC code"
            placeholderTextColor={COLORS.textMuted}
            value={ifscCode}
            onChangeText={setIfscCode}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  );

  const renderUpiFields = () => (
    <View style={styles.fieldsContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>UPI ID</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="phone-portrait-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="example@upi"
            placeholderTextColor={COLORS.textMuted}
            value={upiId}
            onChangeText={setUpiId}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw Funds</Text>
        <View style={{ width: 36 }} />
      </View>

      <LinearGradient colors={[COLORS.primary + '15', COLORS.pink]} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
        {fetching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.balanceAmount}>₹{earnings?.availableBalance || 0}</Text>
        )}
        <View style={styles.balanceRow}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceSubLabel}>Total Earnings</Text>
            <Text style={styles.balanceSubAmount}>₹{earnings?.totalEarnings || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceCol}>
            <Text style={styles.balanceSubLabel}>Total Withdrawn</Text>
            <Text style={styles.balanceSubAmount}>₹{earnings?.totalWithdrawn || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.minNotice}>
        <Ionicons name="information-circle" size={18} color={COLORS.textSecondary} />
        <Text style={styles.minNoticeText}>Minimum withdrawal amount is ₹{minWithdrawal}</Text>
      </View>

      <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder={`Minimum ₹${minWithdrawal}`}
            placeholderTextColor={COLORS.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.methodToggle}>
        <TouchableOpacity
          style={[styles.methodButton, paymentMethod === 'bank' && styles.methodButtonActive]}
          onPress={() => setPaymentMethod('bank')}
        >
          <Ionicons
            name="business"
            size={18}
            color={paymentMethod === 'bank' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.methodText, paymentMethod === 'bank' && styles.methodTextActive]}>
            Bank Transfer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodButton, paymentMethod === 'upi' && styles.methodButtonActive]}
          onPress={() => setPaymentMethod('upi')}
        >
          <Ionicons
            name="phone-portrait"
            size={18}
            color={paymentMethod === 'upi' ? COLORS.white : COLORS.textSecondary}
          />
          <Text style={[styles.methodText, paymentMethod === 'upi' && styles.methodTextActive]}>
            UPI
          </Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === 'bank' ? renderBankFields() : renderUpiFields()}

      <TouchableOpacity onPress={handleWithdraw} activeOpacity={0.8} disabled={loading}>
        <LinearGradient colors={COLORS.gradient.call} style={[styles.submitButton, loading && { opacity: 0.6 }]}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Withdrawal Request</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/withdraw-history')} style={styles.historyLink}>
        <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        <Text style={styles.historyLinkText}>View Withdrawal History</Text>
      </TouchableOpacity>
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
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  balanceCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: COLORS.textSecondary },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  balanceRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg,
    backgroundColor: COLORS.white + '80', borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, width: '100%',
  },
  balanceCol: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 30, backgroundColor: COLORS.border },
  balanceSubLabel: { fontSize: 11, color: COLORS.textMuted },
  balanceSubAmount: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  minNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.lg,
    backgroundColor: COLORS.dark[100], padding: SPACING.md, borderRadius: RADIUS.lg,
  },
  minNoticeText: { fontSize: 13, color: COLORS.textSecondary },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  inputGroup: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, gap: 8,
  },
  input: {
    flex: 1, height: 48, fontSize: 15, color: COLORS.textPrimary,
  },
  methodToggle: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
  },
  methodButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingVertical: 14,
    borderWidth: 2, borderColor: COLORS.border,
  },
  methodButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  methodText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  methodTextActive: { color: COLORS.white },
  fieldsContainer: { marginBottom: SPACING.lg },
  submitButton: {
    marginHorizontal: SPACING.lg, height: 56, borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  historyLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: SPACING.xl, paddingVertical: SPACING.md,
  },
  historyLinkText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
