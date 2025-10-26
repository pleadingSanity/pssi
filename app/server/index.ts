import express from 'express';
import { getSystemStats } from './routes/systemStats.js';
import { aiTestEndpoint } from './routes/aiTest.js';
import { repoHealing } from './routes/repoHealing.js';
import { deployHooks } from './routes/deployHooks.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', version: '0.1.0' });
});

// System stats endpoint
app.get('/api/stats', getSystemStats);

// AI test endpoint
app.post('/api/ai/test', aiTestEndpoint);

// Repo healing endpoint
app.post('/api/repo/heal', repoHealing);

// Deploy hooks
app.post('/api/deploy/hook', deployHooks);

app.listen(PORT, () => {
  console.log(`PSSI Server running on http://localhost:${PORT}`);
});

export default app;
