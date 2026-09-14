import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import { COLORS } from '../../utils/constants';

const TabIcon = ({ name, color, focused, badge }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={name} size={24} color={color} />
    {badge > 0 && (
      <View style={{
        position: 'absolute', top: -4, right: -10,
        backgroundColor: COLORS.error, borderRadius: 10,
        minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
      }}>
        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </View>
);

export default function TabLayout() {
  const { isLoggedIn, loading } = useAuthStore();

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          title: 'Recents',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
