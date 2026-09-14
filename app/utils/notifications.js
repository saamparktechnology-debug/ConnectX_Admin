import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('Expo Push Token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const storedToken = await AsyncStorage.getItem('push_token');
    if (storedToken !== token) {
      try {
        await api.post('/user/fcm-token', { fcmToken: token });
        await AsyncStorage.setItem('push_token', token);
        console.log('Push token sent to server');
      } catch (error) {
        console.log('Failed to send push token:', error.message);
      }
    }

    return token;
  } catch (error) {
    console.log('Error registering for push notifications:', error);
    return null;
  }
};

export const addNotificationListeners = (onReceive, onInteraction) => {
  const receiveSub = Notifications.addNotificationReceivedListener((notification) => {
    if (onReceive) onReceive(notification);
  });

  const interactionSub = Notifications.addNotificationResponseReceivedListener((response) => {
    if (onInteraction) onInteraction(response);
  });

  return () => {
    receiveSub.remove();
    interactionSub.remove();
  };
};
