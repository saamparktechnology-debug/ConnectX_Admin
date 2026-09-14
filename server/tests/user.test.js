const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const { generateUserToken, randomEmail } = require('./helpers');

let userToken;
let userId;
let otherUserId;
let otherUserToken;

beforeAll(async () => {
  const email = randomEmail();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Profile Test User',
      email: email,
      password: 'TestPass123!',
      gender: 'male',
      date_of_birth: '1995-06-15'
    });
  userToken = res.body.data.token;
  userId = res.body.data.user.id;

  const email2 = randomEmail();
  const res2 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other Test User',
      email: email2,
      password: 'TestPass123!',
      gender: 'female',
      date_of_birth: '1998-03-20'
    });
  otherUserToken = res2.body.data.token;
  otherUserId = res2.body.data.user.id;
});

describe('User API Tests', () => {
  // ==================== GET PROFILE ====================
  describe('GET /api/user/profile', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Profile Test User');
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('interests');
      expect(res.body.data).toHaveProperty('preferences');
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/user/profile');
      expect(res.status).toBe(401);
    });
  });

  // ==================== UPDATE PROFILE ====================
  describe('PUT /api/user/profile', () => {
    it('should update profile fields', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'I love dating apps!',
          occupation: 'Software Engineer',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          height: 175
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with no valid fields', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ invalidField: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .send({ bio: 'test' });
      expect(res.status).toBe(401);
    });
  });

  // ==================== UPDATE PREFERENCES ====================
  describe('PUT /api/user/preferences', () => {
    it('should update preferences', async () => {
      const res = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          min_age: 21,
          max_age: 35,
          preferred_gender: 'female',
          max_distance_km: 50
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .put('/api/user/preferences')
        .send({ min_age: 18 });
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET INTERESTS ====================
  describe('GET /api/user/interests', () => {
    it('should get all interests', async () => {
      const res = await request(app)
        .get('/api/user/interests')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.interests)).toBe(true);
      expect(res.body.data.interests.length).toBeGreaterThan(0);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/user/interests');
      expect(res.status).toBe(401);
    });
  });

  // ==================== SET INTERESTS ====================
  describe('POST /api/user/interests', () => {
    it('should set user interests', async () => {
      const res = await request(app)
        .post('/api/user/interests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ interestIds: [1, 2, 3] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail if interestIds is not an array', async () => {
      const res = await request(app)
        .post('/api/user/interests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ interestIds: 'not_an_array' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should clear interests with empty array', async () => {
      const res = await request(app)
        .post('/api/user/interests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ interestIds: [] });
      expect(res.status).toBe(200);
    });
  });

  // ==================== UPLOAD PHOTOS ====================
  describe('POST /api/user/photos', () => {
    it('should fail with no photos', async () => {
      const res = await request(app)
        .post('/api/user/photos')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET OTHER USER PROFILE ====================
  describe('GET /api/user/user/:userId', () => {
    it('should get other user profile', async () => {
      const res = await request(app)
        .get(`/api/user/user/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Other Test User');
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('interests');
    });

    it('should fail for non-existent user', async () => {
      const res = await request(app)
        .get('/api/user/user/99999')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  // ==================== BLOCK / UNBLOCK ====================
  describe('Block/Unblock User', () => {
    it('should block a user', async () => {
      const res = await request(app)
        .post('/api/user/block')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ blockedId: otherUserId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get blocked users list', async () => {
      const res = await request(app)
        .get('/api/user/blocked')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.blockedUsers)).toBe(true);
      expect(res.body.data.blockedUsers.length).toBeGreaterThan(0);
    });

    it('should unblock a user', async () => {
      const res = await request(app)
        .post('/api/user/unblock')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ blockedId: otherUserId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail block without auth', async () => {
      const res = await request(app)
        .post('/api/user/block')
        .send({ blockedId: otherUserId });
      expect(res.status).toBe(401);
    });
  });

  // ==================== REPORT ====================
  describe('POST /api/user/report', () => {
    it('should report a user', async () => {
      const res = await request(app)
        .post('/api/user/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reportedId: otherUserId,
          reason: 'spam',
          description: 'This user is spamming'
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/user/report')
        .send({ reportedId: otherUserId, reason: 'spam' });
      expect(res.status).toBe(401);
    });
  });
});
