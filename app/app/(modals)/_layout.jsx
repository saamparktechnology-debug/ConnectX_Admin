import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="call" />
      <Stack.Screen name="recharge" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="withdraw-history" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="edit-photos" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="blocked-users" />
      <Stack.Screen name="earnings" />
    </Stack>
  );
}
