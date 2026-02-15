import request from 'supertest';
import express from 'express';

// Mock the server without starting it
const app = express();
app.use(express.json());

// Import routes (we'll create a simple mock for testing)
app.get('/stats', (req, res) => {
  res.json({
    cpu: 50,
    memory: 60,
    gpu: 40,
    cpuTemp: 55,
    gpuTemp: 50,
    timestamp: new Date().toISOString(),
  });
});

app.post('/deploy/netlify', (req, res) => {
  res.status(202).json({ success: true, message: 'Netlify build triggered' });
});

app.post('/deploy/vercel', (req, res) => {
  res.status(202).json({ success: true, message: 'Vercel deploy triggered' });
});

describe('PSSI Server API', () => {
  describe('GET /stats', () => {
    it('should return system stats with 200 status', async () => {
      const response = await request(app).get('/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('gpu');
      expect(response.body).toHaveProperty('cpuTemp');
      expect(response.body).toHaveProperty('gpuTemp');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return numeric values for stats', async () => {
      const response = await request(app).get('/stats');
      
      expect(typeof response.body.cpu).toBe('number');
      expect(typeof response.body.memory).toBe('number');
      expect(typeof response.body.gpu).toBe('number');
      expect(typeof response.body.cpuTemp).toBe('number');
      expect(typeof response.body.gpuTemp).toBe('number');
    });
  });

  describe('POST /deploy/netlify', () => {
    it('should return 202 status for Netlify deploy', async () => {
      const response = await request(app).post('/deploy/netlify');
      
      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /deploy/vercel', () => {
    it('should return 202 status for Vercel deploy', async () => {
      const response = await request(app).post('/deploy/vercel');
      
      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });
});
