const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const { randomEmail } = require('./helpers');

let user1Token, user2Token;
let user1Id, user2Id;
let matchId;

beforeAll(async () => {
  const email1 = randomEmail();
  const res1 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Chat User 1',
      email: email1,
      password: 'TestPass123!',
      gender: 'male',
      date_of_birth: '1995-06-15'
    });
  user1Token = res1.body.data.token;
  user1Id = res1.body.data.user.id;

  const email2 = randomEmail();
  const res2 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Chat User 2',
      email: email2,
      password: 'TestPass123!',
      gender: 'female',
      date_of_birth: '1998-03-20'
    });
  user2Token = res2.body.data.token;
  user2Id = res2.body.data.user.id;

  await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', ['/uploads/photos/test1.jpg', user1Id]);
  await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', ['/uploads/photos/test2.jpg', user2Id]);

  const swipeRes = await request(app)
    .post('/api/discover/swipe')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({ swipedId: user2Id, action: 'like' });

  const swipeRes2 = await request(app)
    .post('/api/discover/swipe')
    .set('Authorization', `Bearer ${user2Token}`)
    .send({ swipedId: user1Id, action: 'like' });

  const matchesRes = await request(app)
    .get('/api/discover/matches')
    .set('Authorization', `Bearer ${user1Token}`);

  if (matchesRes.body.data.matches.length > 0) {
    matchId = matchesRes.body.data.matches[0].id;
  }
});

describe('Chat API Tests', () => {
  // ==================== SEND MESSAGE ====================
  describe('POST /api/chat/send/:matchId', () => {
    it('should send a message', async () => {
      if (!matchId) return;
      const res = await request(app)
        .post(`/api/chat/send/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ message_text: 'Hello from test!' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messageId).toBeDefined();
    });

    it('should send a message with type', async () => {
      if (!matchId) return;
      const res = await request(app)
        .post(`/api/chat/send/${matchId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ message_text: 'Hello back!', message_type: 'text' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail for non-existent match', async () => {
      const res = await request(app)
        .post('/api/chat/send/99999')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ message_text: 'Test' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post(`/api/chat/send/${matchId || 1}`)
        .send({ message_text: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET MESSAGES ====================
  describe('GET /api/chat/messages/:matchId', () => {
    it('should get messages for a match', async () => {
      if (!matchId) return;
      const res = await request(app)
        .get(`/api/chat/messages/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
    });

    it('should support limit and offset', async () => {
      if (!matchId) return;
      const res = await request(app)
        .get(`/api/chat/messages/${matchId}?limit=10&offset=0`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get(`/api/chat/messages/${matchId || 1}`);
      expect(res.status).toBe(401);
    });
  });

  // ==================== MARK AS READ ====================
  describe('POST /api/chat/read/:matchId', () => {
    it('should mark messages as read', async () => {
      if (!matchId) return;
      const res = await request(app)
        .post(`/api/chat/read/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== UNREAD COUNT ====================
  describe('GET /api/chat/unread', () => {
    it('should get unread count', async () => {
      const res = await request(app)
        .get('/api/chat/unread')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.unreadCount).toBe('number');
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/chat/unread');
      expect(res.status).toBe(401);
    });
  });

  // ==================== ICE BREAKER ====================
  describe('POST /api/chat/icebreaker/:matchId', () => {
    it('should send an ice breaker', async () => {
      if (!matchId) return;
      const res = await request(app)
        .post(`/api/chat/icebreaker/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ text: 'What is your favorite travel destination?' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messageId).toBeDefined();
    });
  });

  // ==================== DELETE MESSAGE ====================
  describe('DELETE /api/chat/message/:messageId', () => {
    it('should delete a message', async () => {
      if (!matchId) return;
      const sendRes = await request(app)
        .post(`/api/chat/send/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ message_text: 'Message to delete' });

      const messageId = sendRes.body.data.messageId;
      const res = await request(app)
        .delete(`/api/chat/message/${messageId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
