import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// System stats endpoint
app.get('/api/stats', (_req, res) => {
  const stats = {
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    hostname: os.hostname(),
    nodeVersion: process.version,
    loadAverage: os.loadavg()
  }
  res.json(stats)
})

// AI test endpoint
app.post('/api/ai/test', async (req, res) => {
  try {
    const { prompt, model = 'test' } = req.body
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Simulate AI response - in production, this would call an actual AI service
    const response = {
      model,
      prompt,
      response: `Echo from AI endpoint: ${prompt}`,
      timestamp: new Date().toISOString(),
      tokens: prompt.length,
      processing_time_ms: Math.random() * 1000
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      error: 'AI processing failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Deploy hooks endpoint
app.post('/api/deploy/hook', async (req, res) => {
  try {
    const { event, repository, ref } = req.body
    
    console.log(`Deploy hook received: ${event} for ${repository} on ${ref}`)
    
    // Execute deploy script
    const scriptPath = join(__dirname, '..', '..', 'scripts', 'win', 'deploy.ps1')
    
    res.json({
      status: 'accepted',
      message: 'Deploy hook received',
      event,
      timestamp: new Date().toISOString()
    })
    
    // Run deploy script asynchronously (don't wait for completion)
    const deploy = spawn('powershell.exe', ['-File', scriptPath, event])
    
    deploy.stdout.on('data', (data) => {
      console.log(`Deploy stdout: ${data}`)
    })
    
    deploy.stderr.on('data', (data) => {
      console.error(`Deploy stderr: ${data}`)
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Deploy hook failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Repo healing endpoint
app.post('/api/repo/heal', async (_req, res) => {
  try {
    const pythonPath = join(__dirname, '..', '..', 'python', 'tasks', 'repo_healing.py')
    
    const python = spawn('python', [pythonPath])
    let stdout = ''
    let stderr = ''
    
    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    python.on('close', (code) => {
      if (code !== 0) {
        res.status(500).json({ 
          error: 'Repo healing failed', 
          code, 
          stderr 
        })
      } else {
        res.json({ 
          status: 'success', 
          output: stdout,
          timestamp: new Date().toISOString()
        })
      }
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Repo healing failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

app.listen(PORT, () => {
  console.log(`PSSI API Server running on http://localhost:${PORT}`)
  console.log(`- Health: http://localhost:${PORT}/health`)
  console.log(`- Stats: http://localhost:${PORT}/api/stats`)
  console.log(`- AI Test: http://localhost:${PORT}/api/ai/test`)
})

export default app
