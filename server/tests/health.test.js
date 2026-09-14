const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  it('should return API health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Connecto API is running');
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
