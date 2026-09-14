const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const { generateUserToken, randomEmail } = require('./helpers');

let user1Token, user2Token, user3Token;
let user1Id, user2Id, user3Id;

beforeAll(async () => {
  const email1 = randomEmail();
  const res1 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Discover User 1',
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
      name: 'Discover User 2',
      email: email2,
      password: 'TestPass123!',
      gender: 'female',
      date_of_birth: '1998-03-20'
    });
  user2Token = res2.body.data.token;
  user2Id = res2.body.data.user.id;

  const email3 = randomEmail();
  const res3 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Discover User 3',
      email: email3,
      password: 'TestPass123!',
      gender: 'female',
      date_of_birth: '1997-08-10'
    });
  user3Token = res3.body.data.token;
  user3Id = res3.body.data.user.id;

  await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', ['/uploads/photos/test1.jpg', user1Id]);
  await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', ['/uploads/photos/test2.jpg', user2Id]);
  await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', ['/uploads/photos/test3.jpg', user3Id]);
});

describe('Discover API Tests', () => {
  // ==================== GET DISCOVER USERS ====================
  describe('GET /api/discover', () => {
    it('should get swipeable users', async () => {
      const res = await request(app)
        .get('/api/discover')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/discover');
      expect(res.status).toBe(401);
    });
  });

  // ==================== SWIPE ====================
  describe('POST /api/discover/swipe', () => {
    it('should like a user', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ swipedId: user2Id, action: 'like' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matched).toBe(false);
    });

    it('should dislike a user', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ swipedId: user3Id, action: 'dislike' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should super_like a user', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ swipedId: user3Id, action: 'super_like' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should create match on mutual like', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ swipedId: user1Id, action: 'like' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matched).toBe(true);
      expect(res.body.data.match).toBeDefined();
    });

    it('should fail without swipedId', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without action', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ swipedId: user2Id });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid action', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ swipedId: user2Id, action: 'invalid_action' });
      expect(res.status).toBe(400);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/discover/swipe')
        .send({ swipedId: user2Id, action: 'like' });
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET LIKES ====================
  describe('GET /api/discover/likes', () => {
    it('should get who liked you', async () => {
      const res = await request(app)
        .get('/api/discover/likes')
        .set('Authorization', `Bearer ${user3Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.likes)).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/discover/likes');
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET MATCHES ====================
  describe('GET /api/discover/matches', () => {
    it('should get user matches', async () => {
      const res = await request(app)
        .get('/api/discover/matches')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.matches)).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/discover/matches');
      expect(res.status).toBe(401);
    });
  });

  // ==================== UNMATCH ====================
  describe('DELETE /api/discover/unmatch/:matchId', () => {
    it('should unmatch a user', async () => {
      const matchRes = await request(app)
        .get('/api/discover/matches')
        .set('Authorization', `Bearer ${user1Token}`);

      if (matchRes.body.data.matches.length > 0) {
        const matchId = matchRes.body.data.matches[0].id;
        const res = await request(app)
          .delete(`/api/discover/unmatch/${matchId}`)
          .set('Authorization', `Bearer ${user1Token}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('should fail without auth', async () => {
      const res = await request(app).delete('/api/discover/unmatch/1');
      expect(res.status).toBe(401);
    });
  });
});
