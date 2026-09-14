import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/useAuthStore';
import { COLORS } from '../utils/constants';
import { registerForPushNotifications } from '../utils/notifications';

SplashScreen.preventAutoHideAsync();

function CustomSplash({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundDark]} style={splashStyles.container}>
      <Animated.View style={[splashStyles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={splashStyles.logoContainer}>
          <Image source={require('../assets/images/logo.jpeg')} style={splashStyles.logoImage} resizeMode="contain" />
        </View>
        <Text style={splashStyles.title}>ConnectX</Text>
        <Text style={splashStyles.tagline}>100% Real Friendships</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', justifyContent: 'center' },
  logoContainer: { marginBottom: 20 },
  logoImage: {
    width: 120, height: 120, borderRadius: 60,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
  },
  title: { fontSize: 38, fontWeight: '900', color: COLORS.textPrimary, fontStyle: 'italic' },
  tagline: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
});

export default function RootLayout() {
  const { initialize, loading } = useAuthStore();
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    initialize().then(() => {
      setAppReady(true);
      registerForPushNotifications();
    });
  }, []);

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady || !splashDone) {
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
