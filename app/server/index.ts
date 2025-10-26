import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/stats - Return mocked system stats
app.get('/api/stats', (req: Request, res: Response) => {
  const stats = {
    cpu: {
      usage: Math.random() * 60 + 20, // 20-80%
      temp: Math.random() * 30 + 50,   // 50-80°C
    },
    ram: {
      usage: Math.random() * 50 + 30, // 30-80%
      total: 16384,                    // 16 GB
      used: Math.random() * 8192 + 4096, // 4-12 GB
    },
    gpu: {
      usage: Math.random() * 70 + 10, // 10-80%
      temp: Math.random() * 35 + 45,   // 45-80°C
    },
  };
  res.json(stats);
});

// POST /api/optimize - Return harmless optimization plan
app.post('/api/optimize', (req: Request, res: Response) => {
  const plan = `Optimization Plan (Dry-run):

1. Clear temporary files (safe)
2. Optimize startup programs (review only)
3. Update drivers (check available)
4. Defragment disk (if needed)
5. Clean browser cache (safe)

Note: This is a dry-run. No changes were made.`;

  res.json({ plan, status: 'dry-run', changes: [] });
});

// POST /api/repos/heal - Run Python dependency healing script
app.post('/api/repos/heal', async (req: Request, res: Response) => {
  const { repoUrl, branch = 'main' } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  const scriptPath = path.join(__dirname, '../../python/tasks/heal_deps.py');
  const args = ['--repo', repoUrl, '--branch', branch];

  // Only add --apply if GH_TOKEN is present
  if (process.env.GH_TOKEN) {
    args.push('--apply');
  }

  try {
    const python = spawn('python3', [scriptPath, ...args]);
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
        res.json({
          status: 'success',
          output,
          dryRun: !process.env.GH_TOKEN,
        });
      } else {
        res.status(500).json({
          error: 'Script execution failed',
          output,
          errorOutput,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run healing script', details: String(error) });
  }
});

// POST /api/deploy/netlify - Trigger Netlify build hook
app.post('/api/deploy/netlify', async (req: Request, res: Response) => {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK;

  if (!hookUrl) {
    return res.status(400).json({
      error: 'NETLIFY_BUILD_HOOK not configured',
      status: 'dry-run',
    });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(hookUrl, { method: 'POST' });
    res.status(202).json({
      status: 'accepted',
      message: 'Netlify deployment triggered',
      hookStatus: response.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger Netlify deployment', details: String(error) });
  }
});

// POST /api/deploy/vercel - Trigger Vercel deploy hook
app.post('/api/deploy/vercel', async (req: Request, res: Response) => {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;

  if (!hookUrl) {
    return res.status(400).json({
      error: 'VERCEL_DEPLOY_HOOK not configured',
      status: 'dry-run',
    });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(hookUrl, { method: 'POST' });
    res.status(202).json({
      status: 'accepted',
      message: 'Vercel deployment triggered',
      hookStatus: response.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger Vercel deployment', details: String(error) });
  }
});

// POST /api/ai/test - Test OpenAI integration
app.post('/api/ai/test', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.json({
      status: 'echo',
      prompt,
      response: `Echo: ${prompt} (OpenAI API key not configured)`,
    });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    });

    const data = (await response.json()) as any;
    res.json({
      status: 'success',
      prompt,
      response: data.choices?.[0]?.message?.content || 'No response',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to call OpenAI API', details: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`PSSI server running on http://localhost:${PORT}`);
});

export default app;
