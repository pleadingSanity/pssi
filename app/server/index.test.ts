import request from 'supertest';
import app from './index';

describe('API Endpoints', () => {
  describe('GET /api/stats', () => {
    it('should return system stats', async () => {
      const response = await request(app).get('/api/stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('ram');
      expect(response.body).toHaveProperty('gpu');
      expect(response.body.cpu).toHaveProperty('usage');
      expect(response.body.cpu).toHaveProperty('temp');
    });
  });

  describe('POST /api/optimize', () => {
    it('should return optimization plan', async () => {
      const response = await request(app).post('/api/optimize').send({});
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('plan');
      expect(response.body).toHaveProperty('status', 'dry-run');
    });
  });

  describe('POST /api/deploy/netlify', () => {
    it('should return 400 or 202 depending on configuration', async () => {
      const response = await request(app).post('/api/deploy/netlify').send({});
      expect([202, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.status).toBe('dry-run');
      } else {
        expect(response.body).toHaveProperty('status', 'accepted');
      }
    });
  });

  describe('POST /api/deploy/vercel', () => {
    it('should return 400 or 202 depending on configuration', async () => {
      const response = await request(app).post('/api/deploy/vercel').send({});
      expect([202, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.status).toBe('dry-run');
      } else {
        expect(response.body).toHaveProperty('status', 'accepted');
      }
    });
  });

  describe('POST /api/ai/test', () => {
    it('should echo prompt when no API key is configured', async () => {
      const response = await request(app)
        .post('/api/ai/test')
        .send({ prompt: 'Hello AI' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('prompt', 'Hello AI');
      expect(response.body).toHaveProperty('response');
    });

    it('should return error when prompt is missing', async () => {
      const response = await request(app).post('/api/ai/test').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
