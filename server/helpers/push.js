const db = require('../config/db');

const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const [users] = await db.query('SELECT fcm_token FROM users WHERE id = ?', [userId]);
    if (!users.length || !users[0].fcm_token) {
      console.log(`No FCM token for user ${userId}`);
      return false;
    }

    const fcmToken = users[0].fcm_token;
    if (!Expo.isExpoPushToken(fcmToken)) {
      console.log(`Invalid Expo push token for user ${userId}: ${fcmToken}`);
      return false;
    }

    const message = {
      to: fcmToken,
      sound: 'default',
      title,
      body,
      data,
      badge: 1,
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push chunk:', error);
      }
    }

    console.log(`Push notification sent to user ${userId}: ${title}`);
    return tickets;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
};

const sendBulkPushNotifications = async (userIds, title, body, data = {}) => {
  const messages = [];

  for (const userId of userIds) {
    const [users] = await db.query('SELECT fcm_token FROM users WHERE id = ?', [userId]);
    if (!users.length || !users[0].fcm_token) continue;
    if (!Expo.isExpoPushToken(users[0].fcm_token)) continue;

    messages.push({
      to: users[0].fcm_token,
      sound: 'default',
      title,
      body,
      data,
      badge: 1,
    });
  }

  if (messages.length === 0) return [];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending bulk push chunk:', error);
    }
  }

  return tickets;
};

module.exports = { sendPushNotification, sendBulkPushNotifications };
