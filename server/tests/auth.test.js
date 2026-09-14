const request = require('supertest');
const app = require('../app');
const { generateUserToken, randomEmail, randomPhone } = require('./helpers');

let testUserToken;
let testUserId;
const testEmail = randomEmail();
const testPhone = randomPhone();
const testPassword = 'TestPass123!';

describe('Auth API Tests', () => {
  // ==================== REGISTER ====================
  describe('POST /api/auth/register', () => {
    it('should register a new user with email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testEmail,
          password: testPassword,
          gender: 'male',
          date_of_birth: '1995-06-15'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.token).toBeDefined();
      testUserToken = res.body.data.token;
      testUserId = res.body.data.user.id;
    });

    it('should register a new user with phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Phone User',
          phone: testPhone,
          password: testPassword,
          gender: 'female',
          date_of_birth: '1998-03-20'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.phone).toBe(testPhone);
    });

    it('should fail if name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: randomEmail(), password: testPassword });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'No Password', email: randomEmail() });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if neither email nor phone provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'No Contact', password: testPassword });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup Email', email: testEmail, password: testPassword });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup Phone', phone: testPhone, password: testPassword });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== LOGIN ====================
  describe('POST /api/auth/login', () => {
    it('should login with email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('Test User');
    });

    it('should login with phone', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: testPhone, password: testPassword });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: testPassword });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if email and phone are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: testPassword });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET ME ====================
  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== FCM TOKEN ====================
  describe('POST /api/auth/fcm-token', () => {
    it('should update FCM token', async () => {
      const res = await request(app)
        .post('/api/auth/fcm-token')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ fcm_token: 'test_fcm_token_12345' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .post('/api/auth/fcm-token')
        .send({ fcm_token: 'test_fcm_token' });
      expect(res.status).toBe(401);
    });
  });
});
