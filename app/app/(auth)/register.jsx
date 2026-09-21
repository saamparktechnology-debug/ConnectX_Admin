import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';
import { COLORS, SPACING, RADIUS, API_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [step, setStep] = useState('phone');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // KYC state
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [upiId, setUpiId] = useState('');

  // Voice note state
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  const { sendOtp, verifyOtp, resendOtp } = useAuthStore();
  const router = useRouter();

  const handleDobChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    setDob(formatted);
  };

  const genders = [
    { value: 'male', label: 'Male', icon: 'male' },
    { value: 'female', label: 'Female', icon: 'female' },
  ];

  const languages = [
    { value: 'assamese', label: 'Assamese' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'bodo', label: 'Bodo' },
    { value: 'dogri', label: 'Dogri' },
    { value: 'english', label: 'English' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'kashmiri', label: 'Kashmiri' },
    { value: 'konkani', label: 'Konkani' },
    { value: 'maithili', label: 'Maithili' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'manipuri', label: 'Manipuri' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'nepali', label: 'Nepali' },
    { value: 'odia', label: 'Odia' },
    { value: 'punjabi', label: 'Punjabi' },
    { value: 'sanskrit', label: 'Sanskrit' },
    { value: 'santali', label: 'Santali' },
    { value: 'sinhala', label: 'Sinhala' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'urdu', label: 'Urdu' },
  ];

  const languageSentences = {
    assamese: 'মোৰ নাম আৰু মই এই এপ্লিকেশনত এজন ব্যৱহাৰকাৰী হিচাপে যোগ দিছোঁ।',
    bengali: 'আমার নাম এবং আমি এই অ্যাপে একজন ব্যবহারকারী হিসেবে যোগ দিচ্ছি।',
    bodo: 'गाबोर नां मो आरो मो बियोर एप्लिकेशन्दि बानि बानि खें मो।',
    dogri: 'मेरा नाम ऐ ते मैं इस ऐप्लिकेशन विच एक यूज़र वज्जों जुड़ रहा हां।',
    english: 'My name is and I am joining this application as a user.',
    gujarati: 'મારું નામ છે અને હું આ એપ્લિકેશનમાં એક વપરાશકર્તા તરીકે જોડાઈ રહ્યો છું।',
    hindi: 'मेरा नाम है और मैं इस एप्लिकेशन में एक उपयोगकर्ता के रूप में जुड़ रहा हूँ।',
    kannada: 'ನನ್ನ ಹೆಸರು ಮತ್ತು ನಾನು ಈ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಬಳಕೆದಾರರಾಗಿ ಸೇರುತ್ತಿದ್ದೇನೆ।',
    kashmiri: 'میٖنہٕ ناو ہے تئ میٖس یٕس ایپلیکیشنَس منٛز اَس یوزر طریقینcsr جوڑان چھُس۔',
    konkani: 'Mhojem naum ani mi hya applicationak ek upyogkari mhojea khatir zudiyetam.',
    maithili: 'हमर नाम अछि आओर हम एहि एप्लिकेशनमे एक प्रयोगकर्ता के रूपमे जुड़ रहल छी।',
    malayalam: 'എന്റെ പേര് ആണ്, ഞാൻ ഈ ആപ്ലിക്കേഷനിൽ ഒരു ഉപയോക്താവായി ചേരുന്നു।',
    manipuri: 'ドイꯝꯁꯤꯡ ꯀꯨꯝꯕꯗꯨꯅꯌꯨ ꯑꯁꯤ ꯀꯩꯛꯁꯠꯂꯛꯁꯤꯡꯗꯤ ꯀꯃꯕꯛꯇꯣꯛꯁꯠꯃꯤ।',
    marathi: 'माझे नाव आहे आणि मी या अॅप्लिकेशनमध्ये एक वापरकर्ता म्हणून सामील होत आहे।',
    nepali: 'मेरो नाम छ र म यो एप्लिकेशनमा एक प्रयोगकर्ताको रूपमा जोडिँदैछु।',
    odia: 'ମୋ ନାମ ଅଟେ ଏବଂ ମୁଁ ଏହି ଆପ୍ଲିକେସନରେ ଜଣେ ବ୍ୟବହାରକାରୀ ଭାବରେ ଯୋଗ ଦେଉଛି।',
    punjabi: 'ਮੇਰਾ ਨਾਮ ਹੈ ਅਤੇ ਮੈਂ ਇਸ ਐਪਲੀਕੇਸ਼ਨ ਵਿੱਚ ਇੱਕ ਯੂਜ਼ਰ ਵਜੋਂ ਜੁੜ ਰਿਹਾ ਹਾਂ।',
    sanskrit: 'मम नाम अस्ति अहं च अस्मिन् अनुप्रयोगे उपयोक्ता रूपेण सम्युपजाये।',
    santali: 'ᱤᱨᱟᱹᱜ ᱥᱟᱱᱛᱟᱲᱤ ᱨᱮᱱᱟ ᱟᱨ ᱪᱟᱝᱞᱮ ᱛᱮ ᱢᱮᱱᱟᱜᱼᱟ ᱫᱟᱜᱨᱟᱹᱨᱤᱡᱚᱱ ᱛᱮ ᱵᱟᱝᱦᱟᱹᱜᱼᱟ।',
    sinhala: 'මගේ නම වන අතර මම මෙම යෙදුමට පරිශීලකයෙකු ලෙස එක්වෙමි।',
    tamil: 'என் பெயர் மற்றும் நான் இந்த பயன்பாட்டில் ஒரு பயனராக இணைகிறேன்.',
    telugu: 'నా పేరు మరియు నేను ఈ అప్లికేషన్‌లో యూజర్‌గా చేరుతున్నాను।',
    urdu: 'میرا نام ہے اور میں اس ایپلیکیشن میں ایک صارف کے طور پر جوڑ رہا ہوں۔',
  };

  const getMaxStep = () => {
    return gender === 'female' ? 7 : 4;
  };

  const getStepNumber = () => {
    if (step === 'phone') return 1;
    if (step === 'otp') return 2;
    if (step === 3) return 3;
    if (step === 4) return 4;
    if (step === 5) return 5;
    if (step === 6) return 6;
    if (step === 7) return 7;
    return 1;
  };

  const handleBack = () => {
    if (step === 'otp') setStep('phone');
    else if (step === 3) setStep('otp');
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
    else if (step === 6) setStep(5);
    else if (step === 7) setStep(6);
    else router.back();
  };

  const handleNext = () => {
    if (step === 3) {
      if (!gender) return Alert.alert('Error', 'Please select your gender');
      setStep(4);
    } else if (step === 4) {
      if (!name.trim()) return Alert.alert('Error', 'Please enter your Nick Name');
      if (gender === 'female') {
        if (!dob.trim()) return Alert.alert('Error', 'Please enter your date of birth');
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return Alert.alert('Error', 'Please enter date in DD/MM/YYYY format');
      }
      handleUpdateProfile();
    } else if (step === 5) {
      if (!aadharNumber.trim() || aadharNumber.length !== 12) return Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      if (!panNumber.trim() || panNumber.length !== 10) return Alert.alert('Error', 'Please enter a valid 10-character PAN number');
      if (paymentMethod === 'bank') {
        if (!bankAccountNumber.trim()) return Alert.alert('Error', 'Please enter bank account number');
        if (!ifscCode.trim()) return Alert.alert('Error', 'Please enter IFSC code');
        if (!bankName.trim()) return Alert.alert('Error', 'Please enter bank name');
        if (!accountHolderName.trim()) return Alert.alert('Error', 'Please enter account holder name');
      } else {
        if (!upiId.trim()) return Alert.alert('Error', 'Please enter UPI ID');
      }
      setStep(6);
    } else if (step === 6) {
      if (!selectedLanguage) return Alert.alert('Error', 'Please select a language');
      if (!recordedUri) return Alert.alert('Error', 'Please record a voice note');
      setStep(7);
    }
  };

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
      setStep(3);
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

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, gender, email: null, date_of_birth: dob ? dob.split('/').reverse().join('-') : null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      if (gender === 'male') {
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/(tabs)');
        return;
      }

      setStep(5);
    } catch (error) {
      Alert.alert('Error', error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const submitKyc = async (voiceNoteUrl) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const kycData = {
        aadhar_number: aadharNumber,
        pan_number: panNumber,
        voice_note_url: voiceNoteUrl,
        voice_note_language: selectedLanguage,
        ...(paymentMethod === 'bank'
          ? {
              bank_account_number: bankAccountNumber,
              bank_ifsc: ifscCode,
              bank_name: bankName,
              bank_holder_name: accountHolderName,
            }
          : { upi_id: upiId }),
      };

      const response = await fetch(`${API_URL}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'KYC submission failed');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      throw error;
    }
  };

  const uploadVoiceNote = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const formData = new FormData();
      formData.append('voice_note', {
        uri: recordedUri,
        type: 'audio/m4a',
        name: 'voice_note.m4a',
      });
      formData.append('language', selectedLanguage);

      const response = await fetch(`${API_URL}/kyc/upload-voice-note`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Voice note upload failed');
      }

      const result = await response.json();
      return result.data.url;
    } catch (error) {
      console.error('Voice note upload error:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Error', 'Microphone permission is required to record voice note');
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = newRecording;
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordedUri(uri);
        setRecording(null);
        recordingRef.current = null;
        setIsRecording(false);

        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    try {
      if (!recordedUri) return;

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const deleteRecording = () => {
    setRecordedUri(null);
    setRecordingDuration(0);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const renderProgressBar = () => {
    const currentNum = getStepNumber();
    const maxStep = getMaxStep();
    return (
      <View>
        <View style={styles.progress}>
          {Array.from({ length: maxStep }, (_, i) => i + 1).map((s) => (
            <View key={s} style={[styles.progressDot, s <= currentNum && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={styles.stepText}>Step {currentNum} of {maxStep}</Text>
      </View>
    );
  };

  const renderPhoneStep = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Phone Verification</Text>
      <Text style={styles.formSubtitle}>Enter your phone number to get started</Text>

      <View style={styles.phoneContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+91</Text>
        </View>
        <TextInput style={styles.phoneInput} placeholder="Phone Number" placeholderTextColor={COLORS.textMuted}
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
      </View>

      <TouchableOpacity onPress={handleSendOtp} disabled={loading} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={styles.nextButton}>
          {loading ? <ActivityIndicator color="white" size="small" /> : (
            <>
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Verify OTP</Text>
      <Text style={styles.formSubtitle}>Enter 4-digit OTP sent to</Text>
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

      <TouchableOpacity onPress={() => handleVerifyOtp()} disabled={loading} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={styles.nextButton}>
          {loading ? <ActivityIndicator color="white" size="small" /> : (
            <>
              <Text style={styles.nextButtonText}>Verify OTP</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0} style={styles.resendButton}>
        <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>{timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGenderStep = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Select Gender</Text>
      <Text style={styles.formSubtitle}>Help us find better matches for you</Text>
      <View style={styles.genderGrid}>
        {genders.map((g) => (
          <TouchableOpacity key={g.value}
            style={[styles.genderCard, gender === g.value && styles.genderCardActive]}
            onPress={() => setGender(g.value)}>
            <Ionicons name={g.icon} size={32} color={gender === g.value ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.genderLabel, gender === g.value && styles.genderLabelActive]}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={handleNext} disabled={!gender} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={[styles.nextButton, !gender && styles.disabledButton]}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCreateAccountStep = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.formSubtitle}>Choose a Nick Name for your profile</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Nick Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
      </View>
      {gender === 'female' && (
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Date of Birth (DD/MM/YYYY)" placeholderTextColor={COLORS.textMuted} value={dob} onChangeText={handleDobChange} keyboardType="numeric" maxLength={10} />
        </View>
      )}

      <TouchableOpacity onPress={handleNext} disabled={loading || !name.trim()} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={[styles.nextButton, (!name.trim() || loading) && styles.disabledButton]}>
          {loading ? <ActivityIndicator color="white" size="small" /> : (
            <>
              <Text style={styles.nextButtonText}>{gender === 'male' ? 'Create Account' : 'Continue'}</Text>
              <Ionicons name={gender === 'male' ? 'checkmark-circle-outline' : 'arrow-forward'} size={20} color="white" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>KYC Details</Text>
      <Text style={styles.formSubtitle}>Verification information for your safety</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Aadhar Number (12 digits)" placeholderTextColor={COLORS.textMuted} value={aadharNumber} onChangeText={setAadharNumber} keyboardType="number-pad" maxLength={12} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="PAN Number (10 characters)" placeholderTextColor={COLORS.textMuted} value={panNumber} onChangeText={setPanNumber} autoCapitalize="characters" maxLength={10} />
      </View>

      <View style={styles.paymentToggle}>
        <TouchableOpacity
          style={[styles.paymentToggleBtn, paymentMethod === 'bank' && styles.paymentToggleBtnActive]}
          onPress={() => setPaymentMethod('bank')}
        >
          <Ionicons name="business-outline" size={18} color={paymentMethod === 'bank' ? COLORS.white : COLORS.textMuted} />
          <Text style={[styles.paymentToggleText, paymentMethod === 'bank' && styles.paymentToggleTextActive]}>Bank Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentToggleBtn, paymentMethod === 'upi' && styles.paymentToggleBtnActive]}
          onPress={() => setPaymentMethod('upi')}
        >
          <Ionicons name="wallet-outline" size={18} color={paymentMethod === 'upi' ? COLORS.white : COLORS.textMuted} />
          <Text style={[styles.paymentToggleText, paymentMethod === 'upi' && styles.paymentToggleTextActive]}>UPI ID</Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === 'bank' ? (
        <>
          <View style={styles.inputContainer}>
            <Ionicons name="keypad-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Account Number" placeholderTextColor={COLORS.textMuted} value={bankAccountNumber} onChangeText={setBankAccountNumber} keyboardType="number-pad" />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="code-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="IFSC Code" placeholderTextColor={COLORS.textMuted} value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Bank Name" placeholderTextColor={COLORS.textMuted} value={bankName} onChangeText={setBankName} />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Account Holder Name" placeholderTextColor={COLORS.textMuted} value={accountHolderName} onChangeText={setAccountHolderName} />
          </View>
        </>
      ) : (
        <View style={styles.inputContainer}>
          <Ionicons name="at-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="UPI ID (e.g., name@upi)" placeholderTextColor={COLORS.textMuted} value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
        </View>
      )}

      <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Voice Note</Text>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>This voice note helps verify you are a real person</Text>
      </View>

      <Text style={styles.languageLabel}>Select Language</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowLanguageDropdown(true)}>
        <Text style={[styles.dropdownText, !selectedLanguage && styles.dropdownPlaceholder]}>
          {selectedLanguage ? languages.find(l => l.value === selectedLanguage)?.label : 'Choose a language'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={showLanguageDropdown} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLanguageDropdown(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageDropdown(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedLanguage === item.value && styles.modalItemActive]}
                  onPress={() => { setSelectedLanguage(item.value); setShowLanguageDropdown(false); }}
                >
                  <Text style={[styles.modalItemText, selectedLanguage === item.value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {selectedLanguage === item.value && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {selectedLanguage && (
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceLabel}>Read this sentence aloud:</Text>
          <Text style={styles.sentenceText}>{languageSentences[selectedLanguage]}</Text>
        </View>
      )}

      <View style={styles.recordingSection}>
        {!isRecording && !recordedUri && (
          <TouchableOpacity onPress={startRecording} style={styles.recordButton} activeOpacity={0.8}>
            <View style={styles.recordButtonInner}>
              <Ionicons name="mic" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.recordButtonText}>Tap to Record</Text>
            <Text style={styles.recordSubtext}>10 seconds max</Text>
          </TouchableOpacity>
        )}

        {isRecording && (
          <View style={styles.recordingActiveContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingPulse} />
              <Ionicons name="mic" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.recordingTime}>{recordingDuration}s / 10s</Text>
            <TouchableOpacity onPress={stopRecording} style={styles.stopButton} activeOpacity={0.8}>
              <Ionicons name="stop" size={24} color={COLORS.white} />
              <Text style={styles.stopButtonText}>Stop Recording</Text>
            </TouchableOpacity>
          </View>
        )}

        {recordedUri && !isRecording && (
          <View style={styles.playbackContainer}>
            <View style={styles.playbackInfo}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.playbackText}>Recording complete ({recordingDuration}s)</Text>
            </View>
            <View style={styles.playbackActions}>
              <TouchableOpacity onPress={playRecording} style={styles.playbackBtn} activeOpacity={0.8}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={COLORS.primary} />
                <Text style={styles.playbackBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteRecording} style={[styles.playbackBtn, styles.deleteBtn]} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={[styles.playbackBtnText, styles.deleteBtnText]}>Delete</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={startRecording} style={styles.reRecordBtn} activeOpacity={0.8}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.reRecordText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        disabled={!selectedLanguage || !recordedUri}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.gradient.call}
          style={[styles.nextButton, (!selectedLanguage || !recordedUri) && styles.disabledButton]}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const handleKycSubmit = async () => {
    setLoading(true);
    try {
      const voiceNoteUrl = await uploadVoiceNote();
      await submitKyc(voiceNoteUrl);

      const token = await AsyncStorage.getItem('user_token');
      await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: selectedLanguage }),
      });

      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep7 = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Almost Done!</Text>
      <Text style={styles.formSubtitle}>Review your information and create your account</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.reviewLabel}>Name</Text>
          <Text style={styles.reviewValue}>{name}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Ionicons name="call-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.reviewLabel}>Phone</Text>
          <Text style={styles.reviewValue}>+91 {phone}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Ionicons name="male-female-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.reviewLabel}>Gender</Text>
          <Text style={styles.reviewValue}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleKycSubmit} disabled={loading} activeOpacity={0.8}>
        <LinearGradient colors={COLORS.gradient.call} style={[styles.nextButton, loading && styles.disabledButton]}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Create Account</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'phone': return renderPhoneStep();
      case 'otp': return renderOtpStep();
      case 3: return renderGenderStep();
      case 4: return renderCreateAccountStep();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return renderPhoneStep();
    }
  };

  const showProgressBar = step !== 'phone';

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 44 }}>←</Text>
            </TouchableOpacity>
            {showProgressBar && renderProgressBar()}
          </View>

          {renderCurrentStep()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signinText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { marginBottom: 32 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  progress: { flexDirection: 'row', gap: 8, marginTop: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary },
  stepText: { color: COLORS.textMuted, fontSize: 12, marginTop: 8 },
  form: { gap: 16 },
  formTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  formSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: COLORS.border,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  nextButton: {
    height: 56, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginTop: 8,
  },
  nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  genderGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  genderCard: {
    flex: 1, height: 120, backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: COLORS.border,
  },
  genderCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  genderLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  genderLabelActive: { color: COLORS.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  signinText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },

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
  phoneText: { fontSize: 16, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 16 },
  otpInput: {
    width: 56, height: 56, backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    textAlign: 'center', fontSize: 24, fontWeight: '700', color: COLORS.textPrimary,
    borderWidth: 2, borderColor: COLORS.border,
  },
  otpInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.pink },
  verifying: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  verifyingText: { color: COLORS.textSecondary, fontSize: 14 },
  resendButton: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: COLORS.textMuted },

  paymentToggle: {
    flexDirection: 'row', gap: 12, marginTop: 4,
  },
  paymentToggleBtn: {
    flex: 1, height: 48, borderRadius: RADIUS.lg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
  },
  paymentToggleBtnActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  paymentToggleText: {
    fontSize: 14, fontWeight: '600', color: COLORS.textMuted,
  },
  paymentToggleTextActive: {
    color: COLORS.white,
  },

  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.primary + '10', borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
  },
  infoText: {
    flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18,
  },

  languageLabel: {
    fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 16, color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '60%', paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.textPrimary,
  },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  modalItemText: {
    fontSize: 16, color: COLORS.textPrimary,
  },
  modalItemTextActive: {
    color: COLORS.primary, fontWeight: '600',
  },
  sentenceBox: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.primary, borderLeftWidth: 4, marginTop: 12,
  },
  sentenceLabel: {
    fontSize: 12, fontWeight: '600', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase',
  },
  sentenceText: {
    fontSize: 18, color: COLORS.textPrimary, lineHeight: 28, fontWeight: '500',
  },

  recordingSection: {
    alignItems: 'center', paddingVertical: 24,
  },
  recordButton: {
    alignItems: 'center', gap: 12,
  },
  recordButtonInner: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.error,
    alignItems: 'center', justifyContent: 'center',
  },
  recordButtonText: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
  },
  recordSubtext: {
    fontSize: 12, color: COLORS.textMuted,
  },

  recordingActiveContainer: {
    alignItems: 'center', gap: 16,
  },
  recordingIndicator: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.error,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  recordingPulse: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.error + '40',
  },
  recordingTime: {
    fontSize: 24, fontWeight: '700', color: COLORS.textPrimary,
  },
  stopButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.error, borderRadius: RADIUS.lg,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  stopButtonText: {
    fontSize: 14, fontWeight: '700', color: COLORS.white,
  },

  playbackContainer: {
    width: '100%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  playbackInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  playbackText: {
    fontSize: 14, fontWeight: '600', color: COLORS.textPrimary,
  },
  playbackActions: {
    flexDirection: 'row', gap: 12,
  },
  playbackBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 44, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary + '10',
    borderWidth: 1, borderColor: COLORS.primary,
  },
  playbackBtnText: {
    fontSize: 14, fontWeight: '600', color: COLORS.primary,
  },
  deleteBtn: {
    backgroundColor: COLORS.error + '10', borderColor: COLORS.error,
  },
  deleteBtnText: {
    color: COLORS.error,
  },
  reRecordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 40, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  reRecordText: {
    fontSize: 13, fontWeight: '600', color: COLORS.primary,
  },

  reviewCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20,
    gap: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  reviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  reviewLabel: {
    fontSize: 14, color: COLORS.textMuted, width: 60,
  },
  reviewValue: {
    flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right',
  },
  reviewDivider: {
    height: 1, backgroundColor: COLORS.border,
  },
});
