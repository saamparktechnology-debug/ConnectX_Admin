const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const db = require('../config/db');
const { randomEmail } = require('./helpers');

let adminToken;
let adminId;
let testUserId;
const adminEmail = 'testadmin@connecto.com';
const adminPassword = 'AdminPass123!';

beforeAll(async () => {
  const hash = await bcrypt.hash(adminPassword, 12);
  await db.query(
    'INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?, is_active = TRUE',
    [adminEmail, hash, 'Test Admin', 'super_admin', true, hash]
  );

  const email = randomEmail();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin Test User',
      email: email,
      password: 'TestPass123!',
      gender: 'male',
      date_of_birth: '1995-06-15'
    });
  testUserId = res.body.data.user.id;
});

describe('Admin API Tests', () => {
  // ==================== ADMIN LOGIN ====================
  describe('POST /api/admin/login', () => {
    it('should login admin with valid credentials', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: adminEmail, password: adminPassword });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.admin.role).toBe('super_admin');
      adminToken = res.body.data.token;
      adminId = res.body.data.admin.id;
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: adminEmail, password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'nonexistent@admin.com', password: adminPassword });
      expect(res.status).toBe(401);
    });

    it('should fail if email is missing', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ password: adminPassword });
      expect(res.status).toBe(400);
    });

    it('should fail if password is missing', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: adminEmail });
      expect(res.status).toBe(400);
    });
  });

  // ==================== DASHBOARD ====================
  describe('GET /api/admin/dashboard', () => {
    it('should get dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('activeUsers24h');
      expect(res.body.data).toHaveProperty('maleUsers');
      expect(res.body.data).toHaveProperty('femaleUsers');
      expect(res.body.data).toHaveProperty('totalMatches');
      expect(res.body.data).toHaveProperty('totalMessages');
      expect(res.body.data).toHaveProperty('totalSwipes');
      expect(res.body.data).toHaveProperty('premiumUsers');
      expect(res.body.data).toHaveProperty('pendingReports');
      expect(res.body.data).toHaveProperty('newUsersToday');
      expect(res.body.data).toHaveProperty('totalRevenue');
      expect(res.body.data).toHaveProperty('dailyActive');
      expect(res.body.data).toHaveProperty('dailySignups');
    });

    it('should fail without admin auth', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('should fail with user token', async () => {
      const email = randomEmail();
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Regular', email, password: 'Test123!', gender: 'male', date_of_birth: '1995-01-01' });
      const userToken = regRes.body.data.token;

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET USERS ====================
  describe('GET /api/admin/users', () => {
    it('should get paginated user list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('totalPages');
    });

    it('should support search', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support status filter', async () => {
      const res = await request(app)
        .get('/api/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBe(5);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });
  });

  // ==================== GET USER BY ID ====================
  describe('GET /api/admin/users/:userId', () => {
    it('should get user detail', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Admin Test User');
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('interests');
    });

    it('should fail for non-existent user', async () => {
      const res = await request(app)
        .get('/api/admin/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  // ==================== BAN USER ====================
  describe('PUT /api/admin/users/:userId/ban', () => {
    it('should ban a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ banned: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should unban a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ banned: false });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== VERIFY USER ====================
  describe('PUT /api/admin/users/:userId/verify', () => {
    it('should verify a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should unverify a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: false });
      expect(res.status).toBe(200);
    });
  });

  // ==================== DEACTIVATE USER ====================
  describe('PUT /api/admin/users/:userId/deactivate', () => {
    it('should deactivate a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deactivated: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reactivate a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deactivated: false });
      expect(res.status).toBe(200);
    });
  });

  // ==================== REPORTS ====================
  describe('GET /api/admin/reports', () => {
    it('should get paginated reports', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.reports)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
    });

    it('should support status filter', async () => {
      const res = await request(app)
        .get('/api/admin/reports?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/admin/reports/:reportId/status', () => {
    it('should update report status (no reports yet)', async () => {
      const res = await request(app)
        .put('/api/admin/reports/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'reviewed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== SUBSCRIPTIONS ====================
  describe('GET /api/admin/subscriptions', () => {
    it('should get subscriptions list', async () => {
      const res = await request(app)
        .get('/api/admin/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.subscriptions)).toBe(true);
    });
  });

  // ==================== PLANS ====================
  describe('GET /api/admin/plans', () => {
    it('should get subscription plans', async () => {
      const res = await request(app)
        .get('/api/admin/plans')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.plans)).toBe(true);
      expect(res.body.data.plans.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/admin/plans', () => {
    it('should create a new plan', async () => {
      const res = await request(app)
        .post('/api/admin/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Plan',
          description: 'Test plan description',
          duration_days: 30,
          price: 199.00,
          features: { test: true },
          swipe_limit: 10,
          super_like_limit: 5,
          boost_available: false,
          see_who_liked: false,
          unlimited_likes: true,
          display_order: 99
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.planId).toBeDefined();
    });
  });

  describe('PUT /api/admin/plans/:planId', () => {
    it('should update a plan', async () => {
      const plans = await request(app)
        .get('/api/admin/plans')
        .set('Authorization', `Bearer ${adminToken}`);
      const testPlan = plans.body.data.plans.find(p => p.name === 'Test Plan');
      if (testPlan) {
        const res = await request(app)
          .put(`/api/admin/plans/${testPlan.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ price: 299.00, name: 'Updated Test Plan' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  // ==================== SETTINGS ====================
  describe('GET /api/admin/settings', () => {
    it('should get app settings', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.settings)).toBe(true);
      expect(res.body.data.settings.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/admin/settings/:key', () => {
    it('should update a setting', async () => {
      const res = await request(app)
        .put('/api/admin/settings/min_age')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: '18' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== PAYMENT SETTINGS ====================
  describe('GET /api/admin/payment-settings', () => {
    it('should get payment settings', async () => {
      const res = await request(app)
        .get('/api/admin/payment-settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.settings)).toBe(true);
      const keys = res.body.data.settings.map(s => s.setting_key);
      expect(keys).toContain('payment_upi_id');
      expect(keys).toContain('payment_bank_name');
      expect(keys).toContain('payment_account_number');
      expect(keys).toContain('payment_ifsc_code');
      expect(keys).toContain('payment_account_holder');
    });

    it('should fail without admin auth', async () => {
      const res = await request(app).get('/api/admin/payment-settings');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/admin/payment-settings', () => {
    it('should update payment settings', async () => {
      const res = await request(app)
        .put('/api/admin/payment-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          payment_upi_id: 'connecto@upi',
          payment_bank_name: 'State Bank of India',
          payment_account_number: '12345678901234',
          payment_ifsc_code: 'SBIN0001234',
          payment_account_holder: 'Connecto App'
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should verify saved payment settings', async () => {
      const res = await request(app)
        .get('/api/admin/payment-settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const settings = {};
      res.body.data.settings.forEach(s => { settings[s.setting_key] = s.setting_value; });
      expect(settings.payment_upi_id).toBe('connecto@upi');
      expect(settings.payment_bank_name).toBe('State Bank of India');
      expect(settings.payment_account_number).toBe('12345678901234');
      expect(settings.payment_ifsc_code).toBe('SBIN0001234');
      expect(settings.payment_account_holder).toBe('Connecto App');
    });

    it('should fail without admin auth', async () => {
      const res = await request(app)
        .put('/api/admin/payment-settings')
        .send({ payment_upi_id: 'test@upi' });
      expect(res.status).toBe(401);
    });
  });
});
