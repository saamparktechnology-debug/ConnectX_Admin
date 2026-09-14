const jwt = require('jsonwebtoken');
const db = require('../config/db');
const femaleEarningsQueries = require('../queries/femaleEarnings.queries');

const activeCalls = new Map();
const ringTimers = new Map();

const getCallSettings = async () => {
  try {
    const [settings] = await db.query(
      "SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('call_rate_per_minute', 'ring_timeout_seconds', 'max_ring_attempts')"
    );
    const map = {};
    settings.forEach(s => { map[s.setting_key] = s.setting_value; });
    return {
      callRate: parseFloat(map.call_rate_per_minute || 1.50),
      ringTimeout: parseInt(map.ring_timeout_seconds || 10) * 1000,
      maxAttempts: parseInt(map.max_ring_attempts || 5)
    };
  } catch (e) {
    return { callRate: 1.50, ringTimeout: 10000, maxAttempts: 5 };
  }
};

const getAvailableReceivers = async (callerId) => {
  const [caller] = await db.query('SELECT gender FROM users WHERE id = ?', [callerId]);
  if (!caller.length) return [];
  const callerGender = caller[0].gender;
  const oppositeGender = callerGender === 'male' ? 'female' : 'male';

  const [receivers] = await db.query(
    `SELECT u.id, u.name, u.primary_photo, u.gender,
            e.id as expert_id, e.price_per_minute, e.is_available, e.category, e.rating
     FROM users u
     INNER JOIN experts e ON u.id = e.user_id
     WHERE u.gender = ?
       AND u.is_banned = FALSE
       AND u.is_deactivated = FALSE
       AND e.is_available = TRUE
       AND u.id != ?
     ORDER BY e.rating DESC, RAND()
     LIMIT 5`,
    [oppositeGender, callerId]
  );
  return receivers;
};

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await db.query('SELECT id, name, primary_photo, gender FROM users WHERE id = ?', [decoded.id]);
      if (!users.length) {
        return next(new Error('User not found'));
      }
      socket.user = users[0];
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    const userGender = socket.user.gender;
    console.log(`User connected: ${userId} (${userGender})`);

    await db.query('UPDATE users SET is_online = TRUE WHERE id = ?', [userId]);
    socket.join(`user_${userId}`);
    io.emit('user_online', { userId, isOnline: true });

    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
    });

    socket.on('typing_start', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('typing_start', { userId, matchId });
    });

    socket.on('typing_stop', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('typing_stop', { userId, matchId });
    });

    socket.on('message_read', ({ matchId, readerId }) => {
      socket.to(`match_${matchId}`).emit('message_read', { matchId, readerId });
    });

    // =====================================================
    // CALL ROUTING SYSTEM (supports both male→female & female→male)
    // =====================================================

    socket.on('call_route_request', async ({ callerId, targetExpertId }) => {
      try {
        const actualCallerId = callerId || userId;
        const settings = await getCallSettings();
        let receivers;

        if (targetExpertId) {
          const [target] = await db.query(
            `SELECT u.id, u.name, u.primary_photo, u.gender,
                    e.id as expert_id, e.price_per_minute, e.is_available, e.category, e.rating
             FROM users u
             INNER JOIN experts e ON u.id = e.user_id
             WHERE e.id = ? AND u.is_banned = FALSE AND u.is_deactivated = FALSE AND e.is_available = TRUE`,
            [targetExpertId]
          );
          receivers = target.length ? target : await getAvailableReceivers(actualCallerId);
        } else {
          receivers = await getAvailableReceivers(actualCallerId);
        }

        if (receivers.length === 0) {
          socket.emit('call_no_one_available', {
            message: 'No available users right now. Please try again later.'
          });
          return;
        }

        const receiverQueue = receivers.map(f => f.id);
        const [queueResult] = await db.query(
          `INSERT INTO call_queue (caller_id, status, female_queue, attempt_count, max_attempts)
           VALUES (?, 'waiting', ?, 0, ?)`,
          [actualCallerId, JSON.stringify(receiverQueue), settings.maxAttempts]
        );

        const callQueueId = queueResult.insertId;
        const firstReceiver = receivers[0];

        socket.emit('call_queue_created', {
          callQueueId,
          totalReceivers: receivers.length,
          receivers: receivers.map(f => ({
            id: f.id,
            name: f.name,
            photo: f.primary_photo,
            category: f.category,
            rating: f.rating,
            price: f.price_per_minute
          }))
        });

        startRinging(io, socket, callQueueId, actualCallerId, firstReceiver, settings);
      } catch (error) {
        console.error('Call route request error:', error);
        socket.emit('call_error', { message: 'Failed to initiate call routing.' });
      }
    });

    socket.on('call_accept', async ({ callQueueId }) => {
      try {
        const receiverId = userId;
        const [queue] = await db.query('SELECT * FROM call_queue WHERE id = ?', [callQueueId]);
        if (!queue.length || queue[0].status !== 'ringing') return;

        if (ringTimers.has(callQueueId)) {
          clearTimeout(ringTimers.get(callQueueId));
          ringTimers.delete(callQueueId);
        }

        const callerId = queue[0].caller_id;
        const settings = await getCallSettings();

        const [expert] = await db.query('SELECT id FROM experts WHERE user_id = ?', [receiverId]);
        if (!expert.length) return;

        const [callResult] = await db.query(
          `INSERT INTO calls (caller_id, receiver_id, expert_id, status, started_at)
           VALUES (?, ?, ?, 'connecting', NOW())`,
          [callerId, receiverId, expert[0].id]
        );

        await db.query(
          `UPDATE call_queue SET status = 'connected', current_female_id = ?, connected_at = NOW() WHERE id = ?`,
          [receiverId, callQueueId]
        );

        const callId = callResult.insertId;
        activeCalls.set(callQueueId, {
          callId,
          callerId,
          receiverId,
          startTime: Date.now(),
          rate: settings.callRate
        });

        io.to(`user_${callerId}`).emit('call_connected', {
          callId,
          callQueueId,
          receiverId,
          receiverName: socket.user.name,
          receiverPhoto: socket.user.primary_photo,
          rate: settings.callRate
        });

        io.to(`user_${receiverId}`).emit('call_connected', {
          callId,
          callQueueId,
          callerId,
          rate: settings.callRate
        });

        await db.query(
          'UPDATE experts SET total_calls = total_calls + 1 WHERE user_id = ?',
          [receiverId]
        );
      } catch (error) {
        console.error('Call accept error:', error);
      }
    });

    socket.on('call_end', async ({ callQueueId, duration }) => {
      try {
        const callData = activeCalls.get(callQueueId);
        if (!callData) return;

        const { callId, callerId, receiverId, rate } = callData;
        const dur = duration || Math.floor((Date.now() - callData.startTime) / 1000);
        const cost = parseFloat((dur / 60 * rate).toFixed(2));

        await db.query(
          'UPDATE calls SET status = "ended", duration = ?, cost = ?, ended_at = NOW() WHERE id = ?',
          [dur, cost, callId]
        );

        if (cost > 0) {
          await db.query(
            'UPDATE wallets SET balance = balance - ?, total_spent = total_spent + ? WHERE user_id = ?',
            [cost, cost, callerId]
          );
          await db.query(
            'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "call_payment", ?, ?)',
            [callerId, cost, `Call payment - ${dur}s @ ₹${rate}/min`]
          );

          await db.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [cost, receiverId]
          );
          await db.query(
            'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "call_earning", ?, ?)',
            [receiverId, cost, `Call earning - ${dur}s @ ₹${rate}/min`]
          );

          await db.query(
            'UPDATE experts SET total_earnings = total_earnings + ? WHERE user_id = ?',
            [cost, receiverId]
          );

          try {
            const minutesTalked = Math.ceil(dur / 60);
            if (minutesTalked > 0) {
              await femaleEarningsQueries.logCallMinutes({
                female_user_id: receiverId,
                call_id: callId,
                caller_id: callerId,
                minutes_talked: minutesTalked,
                earned_amount: cost
              });

              const achievedRules = await femaleEarningsQueries.checkBonusTargets(receiverId);
              for (const rule of achievedRules) {
                const existing = await db.query(
                  'SELECT id FROM female_bonus_claims WHERE female_user_id = ? AND rule_id = ?',
                  [receiverId, rule.id]
                );
                if (existing[0].length === 0) {
                  await femaleEarningsQueries.claimBonus(
                    receiverId, rule.id, rule.minutes_achieved, rule.bonus_amount
                  );
                  const { sendPushNotification } = require('../helpers/push');
                  await sendPushNotification(
                    receiverId,
                    'Bonus Achieved!',
                    `Congratulations! You earned ₹${rule.bonus_amount} bonus!`,
                    { type: 'bonus_achieved' }
                  );
                }
              }
            }
          } catch (bonusError) {
            console.error('Bonus tracking error:', bonusError);
          }
        }

        await db.query(
          'UPDATE call_queue SET status = "completed", ended_at = NOW() WHERE id = ?',
          [callQueueId]
        );

        activeCalls.delete(callQueueId);
        if (ringTimers.has(callQueueId)) {
          clearTimeout(ringTimers.get(callQueueId));
          ringTimers.delete(callQueueId);
        }

        io.to(`user_${callerId}`).emit('call_ended', { callId, duration: dur, cost });
        io.to(`user_${receiverId}`).emit('call_ended', { callId, duration: dur, earnings: cost });
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    socket.on('call_reject', async ({ callQueueId }) => {
      try {
        const receiverId = userId;
        const [queue] = await db.query('SELECT * FROM call_queue WHERE id = ?', [callQueueId]);
        if (!queue.length || queue[0].status !== 'ringing') return;

        if (ringTimers.has(callQueueId)) {
          clearTimeout(ringTimers.get(callQueueId));
          ringTimers.delete(callQueueId);
        }

        const callerId = queue[0].caller_id;
        const settings = await getCallSettings();
        const newAttempt = queue[0].attempt_count + 1;

        if (newAttempt >= queue[0].max_attempts) {
          await db.query(
            'UPDATE call_queue SET status = "cancelled", ended_at = NOW() WHERE id = ?',
            [callQueueId]
          );
          io.to(`user_${callerId}`).emit('call_no_one_available', {
            message: 'No one available to take your call.'
          });
          return;
        }

        let receiverQueue = [];
        try { receiverQueue = JSON.parse(queue[0].female_queue); } catch (e) {}
        const currentIndex = receiverQueue.indexOf(receiverId);
        if (currentIndex > -1) receiverQueue.splice(currentIndex, 1);

        if (receiverQueue.length === 0) {
          await db.query(
            'UPDATE call_queue SET status = "cancelled", ended_at = NOW() WHERE id = ?',
            [callQueueId]
          );
          io.to(`user_${callerId}`).emit('call_no_one_available', {
            message: 'No more users available. Please try again later.'
          });
          return;
        }

        await db.query(
          'UPDATE call_queue SET attempt_count = ?, female_queue = ? WHERE id = ?',
          [newAttempt, JSON.stringify(receiverQueue), callQueueId]
        );

        io.to(`user_${callerId}`).emit('call_trying_next', {
          callQueueId,
          attempt: newAttempt,
          message: 'Trying next available person...'
        });

        const nextReceiverId = receiverQueue[0];
        const [nextReceiver] = await db.query(
          `SELECT u.id, u.name, u.primary_photo, e.price_per_minute, e.category, e.rating
           FROM users u INNER JOIN experts e ON u.id = e.user_id WHERE u.id = ?`,
          [nextReceiverId]
        );

    if (nextReceiver.length) {
      console.log('Ringing next:', nextReceiver[0].id, nextReceiver[0].name);
      await db.query(
        'UPDATE call_queue SET status = "ringing", current_female_id = ? WHERE id = ?',
        [nextReceiver[0].id, callQueueId]
      );
      startRinging(io, socket, callQueueId, callerId, nextReceiver[0], settings);
    } else {
      console.log('No more receivers available');
    }
      } catch (error) {
        console.error('Call reject error:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      await db.query('UPDATE users SET is_online = FALSE WHERE id = ?', [userId]);
      io.emit('user_online', { userId, isOnline: false });
    });
  });
};
function startRinging(io, socket, callQueueId, callerId, receiver, settings) {
  console.log('startRinging:', { callQueueId, callerId, receiverId: receiver.id, receiverName: receiver.name });

  db.query(
    'UPDATE call_queue SET status = "ringing", current_female_id = ? WHERE id = ?',
    [receiver.id, callQueueId]
  );

  const callerName = socket?.user?.name || 'Someone';
  const callerPhoto = socket?.user?.primary_photo || null;

  io.to(`user_${receiver.id}`).emit('call_incoming', {
    callQueueId,
    callerId,
    callerName,
    callerPhoto
  });

  io.to(`user_${callerId}`).emit('call_ringing', {
    callQueueId,
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverPhoto: receiver.primary_photo
  });

  const timer = setTimeout(async () => {
    ringTimers.delete(callQueueId);
    console.log(`Ring timeout for queue ${callQueueId}, trying next...`);

    const [queue] = await db.query('SELECT * FROM call_queue WHERE id = ?', [callQueueId]);
    if (!queue.length || queue[0].status !== 'ringing') {
      console.log(`Queue ${callQueueId} status: ${queue[0]?.status}, skipping`);
      return;
    }

    let receiverQueue = [];
    try { receiverQueue = JSON.parse(queue[0].female_queue); } catch (e) {
      console.log('Failed to parse female_queue:', queue[0].female_queue);
    }
    const currentIndex = receiverQueue.indexOf(receiver.id);
    if (currentIndex > -1) receiverQueue.splice(currentIndex, 1);
    console.log('After timeout, remaining queue:', receiverQueue, 'current receiver removed:', receiver.id);

    const newAttempt = queue[0].attempt_count + 1;

    if (newAttempt >= queue[0].max_attempts || receiverQueue.length === 0) {
      await db.query(
        'UPDATE call_queue SET status = "cancelled", ended_at = NOW() WHERE id = ?',
        [callQueueId]
      );
      io.to(`user_${callerId}`).emit('call_no_one_available', {
        message: 'No one available to take your call.'
      });
      return;
    }

    await db.query(
      'UPDATE call_queue SET attempt_count = ?, female_queue = ? WHERE id = ?',
      [newAttempt, JSON.stringify(receiverQueue), callQueueId]
    );

    io.to(`user_${callerId}`).emit('call_trying_next', {
      callQueueId,
      attempt: newAttempt,
      message: 'Ring timeout. Trying next person...'
    });

    const nextReceiverId = receiverQueue[0];
    const [nextReceiver] = await db.query(
      `SELECT u.id, u.name, u.primary_photo, e.price_per_minute, e.category, e.rating
       FROM users u INNER JOIN experts e ON u.id = e.user_id WHERE u.id = ?`,
      [nextReceiverId]
    );

    if (nextReceiver.length) {
      startRinging(io, socket, callQueueId, callerId, nextReceiver[0], settings);
    }
  }, settings.ringTimeout);

  ringTimers.set(callQueueId, timer);
}

module.exports = setupSocket;
