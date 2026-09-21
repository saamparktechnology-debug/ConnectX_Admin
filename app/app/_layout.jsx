import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import { COLORS } from '../utils/constants';
import { registerForPushNotifications } from '../utils/notifications';

SplashScreen.preventAutoHideAsync();

function CustomSplash({ onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const poweredOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 1, friction: 3, tension: 20, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(poweredOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const timer = setTimeout(() => onFinish(), 2000);
    return () => clearTimeout(timer);
  }, []);

  const logoRotateInterpolate = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '0deg'] });

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundDark]} style={splashStyles.container}>
      <View style={splashStyles.content}>
        <Animated.View style={[splashStyles.logoContainer, {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { rotate: logoRotateInterpolate }],
        }]}>
          <Image source={require('../assets/images/logo.jpeg')} style={splashStyles.logoImage} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[splashStyles.title, {
          opacity: titleOpacity,
          transform: [{ translateY: titleSlide }],
        }]}>ConnectX</Animated.Text>
        <Animated.Text style={[splashStyles.tagline, {
          opacity: taglineOpacity,
          transform: [{ translateY: taglineSlide }],
        }]}>100% Real Friendships</Animated.Text>
      </View>
      <Animated.Text style={[splashStyles.poweredBy, { opacity: poweredOpacity }]}>POWERED BY PANKAJ TD BULL</Animated.Text>
    </LinearGradient>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  content: { alignItems: 'center', justifyContent: 'center' },
  logoContainer: { marginBottom: 20 },
  logoImage: {
    width: 120, height: 120, borderRadius: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 38, fontWeight: '900', color: COLORS.textPrimary, fontStyle: 'italic' },
  tagline: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  poweredBy: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, position: 'absolute', bottom: 40, textAlign: 'center' },
});

export default function RootLayout() {
  const { initialize } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    initialize().catch(() => {});
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (splashDone) SplashScreen.hideAsync();
  }, [splashDone]);

  if (!splashDone) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <CustomSplash onFinish={() => setSplashDone(true)} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
