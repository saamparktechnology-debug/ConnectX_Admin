import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, Alert, Animated, Easing, FlatList, Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');
const SOCKET_URL = 'https://connecto-server-jzev.onrender.com';
const RATE_PER_MIN = 1.5;
const RING_COUNTDOWN = 10;

const AnimatedDot = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

export default function CallScreen() {
  const { expertId, name, photo, price } = useLocalSearchParams();
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);

  // --- socket ---
  const socketRef = useRef(null);
  const userRef = useRef(null);
  const callQueueIdRef = useRef(null);

  // --- female incoming state ---
  const [isFemaleUser, setIsFemaleUser] = useState(false);

  // --- male call flow state ---
  const [callStatus, setCallStatus] = useState('idle');
  // idle | finding | queue | ringing | trying_next | connected | ended | no_females | incoming
  const [availableFemales, setAvailableFemales] = useState([]);
  const [ringingFemale, setRingingFemale] = useState(null);
  const [ringCountdown, setRingCountdown] = useState(RING_COUNTDOWN);

  // --- connected state ---
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [callId, setCallId] = useState(null);

  // --- audio controls ---
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // --- timers ---
  const timerRef = useRef(null);
  const ringTimerRef = useRef(null);
  const tryingTimerRef = useRef(null);
  const ringSoundRef = useRef(null);
  const ringVibrateRef = useRef(null);

  // --- animations ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringPulseAnim = useRef(new Animated.Value(1)).current;

  // ============================================================
  //  SOCKET INIT + USER RESOLVE
  // ============================================================
  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await AsyncStorage.getItem('user_token');
      if (!token) { router.replace('/(tabs)'); return; }

      let user = storeUser || useAuthStore.getState().user;
      if (!user) {
        try {
          const res = await api.get('/auth/me');
          user = res.data.data.user;
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          useAuthStore.setState({ user, token, isLoggedIn: true });
        } catch (e) {
          console.log('Failed to fetch user:', e.message);
          router.replace('/(tabs)');
          return;
        }
      }
      if (!mounted) return;

      console.log('Call screen user ID:', user.id, 'Name:', user.name, 'Gender:', user.gender);

      userRef.current = user;
      const gender = user?.gender || user?.sex || '';
      const isFemale = gender.toLowerCase() === 'female';
      setIsFemaleUser(isFemale);

      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Call socket connected, user:', user?.id, user?.name);
        setCallStatus('finding');
        socket.emit('call_route_request', {
          callerId: user?.id || user?._id || 0,
          targetExpertId: expertId ? parseInt(expertId) : null,
        });
      });

      socket.on('connect_error', (err) => {
        console.log('Call socket connect_error:', err.message);
      });

      // ---- caller listeners (both old + new event names for Render compatibility) ----
      socket.on('call_queue_created', (data) => {
        setAvailableFemales(data.receivers || data.females || data.availableFemales || []);
        setCallStatus('queue');
      });

      socket.on('call_ringing', (data) => {
        console.log('call_ringing:', JSON.stringify(data));
        callQueueIdRef.current = data.callQueueId;
        setRingingFemale(
          data.female || { id: data.receiverId, name: data.receiverName, photo: data.receiverPhoto }
          || { id: data.femaleId, name: data.femaleName, photo: data.femalePhoto }
          || data
        );
        setRingCountdown(RING_COUNTDOWN);
        setCallStatus('ringing');
        startRingSound();
        startRingCountdown();
      });

      socket.on('call_connected', (data) => {
        console.log('call_connected:', JSON.stringify(data));
        clearRingTimer();
        stopRingSound();
        callQueueIdRef.current = data.callQueueId || callQueueIdRef.current;
        setCallId(data.callId || data.callQueueId);
        setCallStatus('connected');
        startCallTimer();
      });

      socket.on('call_trying_next', (data) => {
        clearRingTimer();
        stopRingSound();
        setCallStatus('trying_next');
        tryingTimerRef.current = setTimeout(() => {
          setCallStatus('finding');
        }, 2500);
      });

      socket.on('call_no_one_available', () => {
        clearAllTimers();
        setCallStatus('no_females');
        setTimeout(() => router.replace('/(tabs)'), 2500);
      });

      // legacy Render server event name
      socket.on('call_no_females_available', () => {
        clearAllTimers();
        setCallStatus('no_females');
        setTimeout(() => router.replace('/(tabs)'), 2500);
      });

      socket.on('call_ended', (data) => {
        clearAllTimers();
        setDuration(data.duration || 0);
        setCost(data.cost || 0);
        setCallStatus('ended');
        setTimeout(() => router.replace('/(tabs)'), 2000);
      });

      socket.on('call_error', (data) => {
        Alert.alert('Call Error', data?.message || 'Something went wrong');
        clearAllTimers();
        router.replace('/(tabs)');
      });

      // ---- incoming call listener ----
      socket.on('call_incoming', (data) => {
        setRingingFemale({
          name: data.callerName || data.name,
          photo: data.callerPhoto || data.photo,
          callerId: data.callerId,
        });
        callQueueIdRef.current = data.callQueueId;
        setCallStatus('incoming');
      });

      socket.on('call_accept_success', (data) => {
        setCallId(data.callId || callQueueIdRef.current);
        setCallStatus('connected');
        startCallTimer();
      });

      socket.on('disconnect', () => {
        console.log('Call socket disconnected');
      });
    })();

    return () => {
      mounted = false;
      clearAllTimers();
      stopRingSound();
      socketRef.current?.disconnect();
    };
  }, []);

  // ============================================================
  //  RING COUNTDOWN
  // ============================================================
  const startRingCountdown = () => {
    clearRingTimer();
    setRingCountdown(RING_COUNTDOWN);
    let remaining = RING_COUNTDOWN;
    ringTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearRingTimer();
      } else {
        setRingCountdown(remaining);
      }
    }, 1000);

    // pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const clearRingTimer = () => {
    if (ringTimerRef.current) {
      clearInterval(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    ringPulseAnim.setValue(1);
  };

  // ============================================================
  //  CALL TIMER (connected)
  // ============================================================
  const startCallTimer = () => {
    clearCallTimer();
    setDuration(0);
    setCost(0);
    const ratePerSec = RATE_PER_MIN / 60;
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
      setCost((prev) => prev + ratePerSec);
    }, 1000);

    // pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const clearCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pulseAnim.setValue(1);
  };

  const clearAllTimers = () => {
    clearCallTimer();
    clearRingTimer();
    if (tryingTimerRef.current) {
      clearTimeout(tryingTimerRef.current);
      tryingTimerRef.current = null;
    }
    stopRingSound();
  };

  // ============================================================
  //  RING SOUND + VIBRATION
  // ============================================================
  const startRingSound = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    } catch (e) {}
    Vibration.vibrate([0, 400, 300, 400, 300, 600], true);
  };

  const stopRingSound = async () => {
    if (ringSoundRef.current) {
      try {
        await ringSoundRef.current.stopAsync();
        await ringSoundRef.current.unloadAsync();
      } catch (e) {}
      ringSoundRef.current = null;
    }
    if (ringVibrateRef.current) {
      clearInterval(ringVibrateRef.current);
      ringVibrateRef.current = null;
    }
    Vibration.cancel();
  };

  // ============================================================
  //  HELPERS
  // ============================================================
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayPhoto = (female) => {
    if (!female?.photo) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${female?.name || 'user'}`;
    return female.photo;
  };

  // ============================================================
  //  ACTIONS
  // ============================================================
  const handleEndCall = () => {
    Alert.alert('End Call', 'Are you sure you want to end this call?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: endCall },
    ]);
  };

  const endCall = () => {
    clearAllTimers();
    socketRef.current?.emit('call_end', {
      callQueueId: callQueueIdRef.current,
      duration,
      cost: parseFloat(cost.toFixed(2)),
    });
    setCallStatus('ended');
    setTimeout(() => router.replace('/(tabs)'), 1500);
  };

  const handleAcceptCall = () => {
    socketRef.current?.emit('call_accept', {
      callQueueId: callQueueIdRef.current,
    });
  };

  const handleRejectCall = () => {
    socketRef.current?.emit('call_reject', {
      callQueueId: callQueueIdRef.current,
    });
    setCallStatus('ended');
    setTimeout(() => router.replace('/(tabs)'), 1000);
  };

  const handleGoBack = () => {
    clearAllTimers();
    socketRef.current?.disconnect();
    router.replace('/(tabs)');
  };

  // ============================================================
  //  ANIMATED PULSE WRAPPER
  // ============================================================
  const PulseAvatar = ({ source, animValue, size = 120, children }) => (
    <Animated.View
      style={[
        styles.avatarContainer,
        { transform: [{ scale: animValue }] },
        { width: size + 20, height: size + 20, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <Image source={{ uri: source }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
      {children}
    </Animated.View>
  );

  // ============================================================
  //  RINGING / INCOMING RENDERERS
  // ============================================================
  const renderRinging = () => (
    <View style={styles.callInfo}>
      <PulseAvatar
        source={displayPhoto(ringingFemale)}
        animValue={ringPulseAnim}
      >
        <View style={styles.activeDot} />
      </PulseAvatar>
      <Text style={styles.callerName}>{ringingFemale?.name || 'Unknown'}</Text>
      <Text style={[styles.callStatus, { color: COLORS.accent }]}>
        Ringing... {ringCountdown}s
      </Text>
      <View style={styles.countdownBar}>
        <View
          style={[
            styles.countdownFill,
            { width: `${(ringCountdown / RING_COUNTDOWN) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  const renderIncoming = () => (
    <View style={styles.callInfo}>
      <PulseAvatar
        source={displayPhoto(ringingFemale)}
        animValue={ringPulseAnim}
      >
        <View style={styles.activeDot} />
      </PulseAvatar>
      <Text style={styles.callerName}>{ringingFemale?.name || 'Unknown'}</Text>
      <Text style={[styles.callStatus, { color: COLORS.accent }]}>Incoming Call</Text>

      <View style={styles.incomingActions}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleRejectCall}>
          <Ionicons name="call" size={28} color={COLORS.white} />
          <Text style={styles.acceptText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptCall}>
          <Ionicons name="call" size={28} color={COLORS.white} />
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConnected = () => (
    <View style={styles.callInfo}>
      <PulseAvatar
        source={displayPhoto(ringingFemale)}
        animValue={pulseAnim}
      >
        <View style={styles.activeDot} />
      </PulseAvatar>
      <Text style={styles.callerName}>{ringingFemale?.name || name}</Text>
      <Text style={[styles.callStatus, styles.callStatusConnected]}>Connected</Text>

      <View style={styles.durationContainer}>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
        <Text style={styles.cost}>₹{cost.toFixed(2)}</Text>
      </View>

      <View style={styles.pricingInfo}>
        <Ionicons name="information-circle" size={16} color={COLORS.accent} />
        <Text style={styles.pricingText}>₹{RATE_PER_MIN.toFixed(2)}/min</Text>
      </View>
    </View>
  );

  const renderFinding = () => (
    <View style={styles.callInfo}>
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: ringPulseAnim }] }]}>
        <View style={[styles.avatar, styles.loadingAvatar]}>
          <Ionicons name="search" size={48} color={COLORS.white} />
        </View>
      </Animated.View>
      <Text style={styles.callerName}>Finding available girls...</Text>
      <Text style={styles.callStatus}>Please wait</Text>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );

  const renderQueue = () => (
    <View style={[styles.callInfo, { flex: 0 }]}>
      <Text style={[styles.callerName, { marginBottom: SPACING.lg }]}>Available Now</Text>
      <FlatList
        data={availableFemales}
        keyExtractor={(item, i) => String(item.id || item._id || i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.md, paddingHorizontal: SPACING.lg }}
        renderItem={({ item }) => (
          <View style={styles.queueCard}>
            <Image
              source={{ uri: item.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}` }}
              style={styles.queueAvatar}
            />
            <Text style={styles.queueName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.queueOnline}>
              <View style={styles.queueOnlineDot} />
              <Text style={styles.queueOnlineText}>Online</Text>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderTryingNext = () => (
    <View style={styles.callInfo}>
      <View style={[styles.avatar, styles.loadingAvatar]}>
        <Ionicons name="swap-horizontal" size={48} color={COLORS.white} />
      </View>
      <Text style={styles.callerName}>Trying next female...</Text>
      <Text style={styles.callStatus}>Please wait</Text>
    </View>
  );

  const renderEnded = () => (
    <View style={styles.callInfo}>
      <View style={[styles.avatar, styles.endedAvatar]}>
        <Ionicons name="call-outline" size={48} color={COLORS.error} />
      </View>
      <Text style={styles.callerName}>{ringingFemale?.name || name}</Text>
      <Text style={[styles.callStatus, styles.callStatusEnded]}>Call Ended</Text>
      {duration > 0 && (
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <Text style={styles.cost}>₹{cost.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );

  const renderNoFemales = () => (
    <View style={styles.callInfo}>
      <View style={[styles.avatar, styles.noAvatar]}>
        <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.callerName}>No females available</Text>
      <Text style={styles.callStatus}>Please try again later</Text>
    </View>
  );

  const renderFemaleView = () => {
    if (callStatus === 'incoming') return renderIncoming();
    if (callStatus === 'connected') return renderConnected();
    if (callStatus === 'ended') return renderEnded();
    // waiting for call_incoming
    return (
      <View style={styles.callInfo}>
        <View style={[styles.avatar, styles.waitingAvatar]}>
          <Ionicons name="hourglass-outline" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.callerName}>Waiting for calls...</Text>
        <Text style={styles.callStatus}>You will be notified when someone calls</Text>
      </View>
    );
  };

  // ============================================================
  //  STATUS-SPECIFIC BODY
  // ============================================================
  const renderBody = () => {
    if (isFemaleUser) return renderFemaleView();

    switch (callStatus) {
      case 'finding':
        return renderFinding();
      case 'queue':
        return renderQueue();
      case 'ringing':
        return renderRinging();
      case 'trying_next':
        return renderTryingNext();
      case 'connected':
        return renderConnected();
      case 'ended':
        return renderEnded();
      case 'no_females':
        return renderNoFemales();
      default:
        return renderFinding();
    }
  };

  // ============================================================
  //  CONTROLS (male connected state)
  // ============================================================
  const renderControls = () => {
    if (callStatus === 'connected') {
      return (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={COLORS.white} />
            <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-low'} size={24} color={COLORS.white} />
            <Text style={styles.controlText}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      );
    }

    // ringing / trying / queue — show end button
    if (['ringing', 'queue', 'trying_next', 'finding', 'incoming'].includes(callStatus)) {
      return (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      );
    }

    // ended / no_females — show back button
    return (
      <View style={styles.controls}>
        <TouchableOpacity style={styles.backToHome} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.backToHomeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <LinearGradient colors={[COLORS.dark[800], COLORS.dark[950]]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Call</Text>
        <View style={{ width: 36 }} />
      </View>

      {renderBody()}
      {renderControls()}
    </LinearGradient>
  );
}

// ================================================================
//  ANIMATED DOT (loading indicator)
// ================================================================
// ================================================================
//  STYLES
// ================================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },

  callInfo: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  loadingAvatar: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  endedAvatar: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(220,53,69,0.15)',
  },
  noAvatar: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  waitingAvatar: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3, borderColor: COLORS.dark[900],
  },
  callerName: { fontSize: 24, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  callStatus: { fontSize: 14, color: COLORS.textMuted },
  callStatusConnected: { color: COLORS.success },
  callStatusEnded: { color: COLORS.error },

  countdownBar: {
    width: 200, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 16, overflow: 'hidden',
  },
  countdownFill: {
    height: '100%', borderRadius: 2,
    backgroundColor: COLORS.accent,
  },

  dotsContainer: {
    flexDirection: 'row', gap: 8, marginTop: 24,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  durationContainer: { marginTop: 20, alignItems: 'center' },
  duration: {
    fontSize: 36, fontWeight: '700', color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
  cost: { fontSize: 16, color: COLORS.accent, fontWeight: '600', marginTop: 4 },

  pricingInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: SPACING.md,
  },
  pricingText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },

  // queue cards
  queueCard: {
    alignItems: 'center', width: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  queueAvatar: { width: 56, height: 56, borderRadius: 28, marginBottom: SPACING.sm },
  queueName: { fontSize: 12, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  queueOnline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  queueOnlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  queueOnlineText: { fontSize: 10, color: COLORS.success },

  // incoming
  incomingActions: {
    flexDirection: 'row', gap: 32, marginTop: 32,
  },
  acceptButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  rejectButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.error,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    shadowColor: COLORS.error, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  acceptText: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // controls
  controls: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 24, paddingBottom: 50, paddingHorizontal: SPACING.xl,
  },
  controlButton: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  controlButtonActive: { backgroundColor: COLORS.primary },
  controlText: { fontSize: 10, color: COLORS.white, fontWeight: '500' },
  endCallButton: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.error,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.error, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  backToHome: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
  },
  backToHomeText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
