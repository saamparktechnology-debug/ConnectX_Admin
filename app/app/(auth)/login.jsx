import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const { sendOtp, verifyOtp, resendOtp } = useAuthStore();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
      startTimer();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) otpRefs[index + 1].current?.focus?.();
    if (newOtp.every((digit) => digit !== '')) {
      setTimeout(() => handleVerifyOtp(newOtp.join('')), 300);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus?.();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    if (!otpValue) otpValue = otp.join('');
    if (otpValue.length !== 4) {
      Alert.alert('Error', 'Please enter 4-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, otpValue);
      router.replace('/(tabs)');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verify Failed', msg);
      setOtp(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      await resendOtp(phone);
      Alert.alert('Success', 'OTP resent successfully');
      startTimer();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend OTP. Please try sending again.';
      Alert.alert('Resend Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Image source={require('../../assets/images/logo.jpeg')} style={styles.logoImage} />
            <Text style={styles.title}>ConnectX</Text>
            <Text style={styles.subtitle}>100% Real Friendships</Text>
            <Text style={styles.tagline}>Friends care about your thoughts, not your looks</Text>
          </View>

          {step === 'phone' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Enter your phone number</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput style={styles.phoneInput} placeholder="Phone Number" placeholderTextColor={COLORS.textMuted}
                  value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
              </View>
              <TouchableOpacity onPress={handleSendOtp} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={COLORS.gradient.call} style={styles.button}>
                  {loading ? <ActivityIndicator color="white" size="small" /> : (
                    <><Text style={styles.buttonText}>Continue</Text><Ionicons name="arrow-forward" size={20} color="white" /></>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Enter 4-digit OTP sent to</Text>
              <Text style={styles.phoneText}>+91 {phone}</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput key={index} ref={otpRefs[index]}
                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                    value={digit} onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad" maxLength={1} selectTextOnFocus />
                ))}
              </View>
              {loading && <View style={styles.verifying}><ActivityIndicator color={COLORS.primary} size="small" /><Text style={styles.verifyingText}>Verifying...</Text></View>}
              <TouchableOpacity onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={COLORS.gradient.call} style={styles.button}>
                  {loading ? <ActivityIndicator color="white" size="small" /> : (
                    <><Text style={styles.buttonText}>Verify OTP</Text><Ionicons name="checkmark-circle" size={20} color="white" /></>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0} style={styles.resendButton}>
                <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>{timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: {
    width: 120, height: 120, borderRadius: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 36, fontWeight: '800', color: COLORS.textPrimary, fontStyle: 'italic', marginTop: 16 },
  subtitle: { fontSize: 16, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  tagline: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  form: { gap: 16 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 4 },
  phoneContainer: { flexDirection: 'row', alignItems: 'center' },
  countryCode: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingHorizontal: 16, height: 56,
    justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
  },
  countryCodeText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  phoneInput: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingHorizontal: 16, height: 56,
    fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  phoneText: { fontSize: 16, color: COLORS.primary, fontWeight: '700', marginBottom: 8 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 16 },
  otpInput: {
    width: 56, height: 56, backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    textAlign: 'center', fontSize: 24, fontWeight: '700', color: COLORS.textPrimary,
    borderWidth: 2, borderColor: COLORS.border,
  },
  otpInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.pink },
  button: {
    height: 56, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  verifying: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  verifyingText: { color: COLORS.textSecondary, fontSize: 14 },
  resendButton: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: COLORS.textMuted },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  signupText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
