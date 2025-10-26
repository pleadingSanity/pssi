import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simple in-memory rate limiter for expensive operations
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// GET /stats - Mock system stats
app.get('/stats', (req: Request, res: Response) => {
  const stats = {
    cpu: Math.round(Math.random() * 100),
    memory: Math.round(Math.random() * 100),
    gpu: Math.round(Math.random() * 100),
    cpuTemp: Math.round(40 + Math.random() * 40),
    gpuTemp: Math.round(40 + Math.random() * 40),
    timestamp: new Date().toISOString(),
  };
  res.json(stats);
});

// POST /optimize - Returns optimization plan
app.post('/optimize', (req: Request, res: Response) => {
  const plan = {
    status: 'planned',
    actions: [
      { type: 'cleanup', target: 'temp_files', estimatedSpace: '2.3 GB' },
      { type: 'defrag', target: 'C:', estimatedTime: '30 min' },
      { type: 'update', target: 'drivers', count: 3 },
    ],
    message: 'Optimization plan ready. No system changes made yet.',
  };
  res.json(plan);
});

// POST /repos/heal - Run Python heal script
app.post('/repos/heal', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!checkRateLimit(clientIp, 5, 60000)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: 60 
    });
  }

  const { repoUrl, branch } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  try {
    const pythonScript = path.join(process.cwd(), 'python/tasks/heal_deps.py');
    const python = spawn('python', [pythonScript], {
      env: { ...process.env, REPO_URL: repoUrl, BRANCH: branch || 'main' },
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, output, message: 'Heal script executed successfully' });
      } else {
        res.status(500).json({ success: false, error: errorOutput || output });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute heal script', details: String(error) });
  }
});

// POST /deploy/netlify - Trigger Netlify build hook
app.post('/deploy/netlify', async (req: Request, res: Response) => {
  const buildHook = process.env.NETLIFY_BUILD_HOOK;

  if (!buildHook) {
    return res.status(400).json({ error: 'NETLIFY_BUILD_HOOK not configured' });
  }

  try {
    await axios.post(buildHook);
    res.status(202).json({ success: true, message: 'Netlify build triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger Netlify build', details: String(error) });
  }
});

// POST /deploy/vercel - Trigger Vercel deploy hook
app.post('/deploy/vercel', async (req: Request, res: Response) => {
  const deployHook = process.env.VERCEL_DEPLOY_HOOK;

  if (!deployHook) {
    return res.status(400).json({ error: 'VERCEL_DEPLOY_HOOK not configured' });
  }

  try {
    await axios.post(deployHook);
    res.status(202).json({ success: true, message: 'Vercel deploy triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger Vercel deploy', details: String(error) });
  }
});

// POST /ai/test - Test AI endpoint
app.post('/ai/test', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.json({
      echo: prompt,
      message: 'OPENAI_API_KEY not configured, echoing prompt only',
    });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      prompt,
      response: response.data.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to call OpenAI API',
      details: String(error),
      echo: prompt,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PSSI Server running on http://localhost:${PORT}`);
});

export default app;
