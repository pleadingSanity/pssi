import { useState, useEffect } from 'react'
import './App.css'

interface SystemStats {
  platform: string
  arch: string
  cpus: number
  totalMemory: number
  freeMemory: number
  uptime: number
  hostname: string
  nodeVersion: string
}

interface ElectronAPI {
  getSystemStats: () => Promise<SystemStats>
  runPythonTask: (taskName: string, args: string[]) => Promise<{ stdout: string; stderr: string }>
  onMainProcessMessage: (callback: (value: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

function App() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pythonOutput, setPythonOutput] = useState<string>('')

  useEffect(() => {
    loadSystemStats()
    const interval = setInterval(loadSystemStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemStats = async () => {
    try {
      const systemStats = await window.electronAPI.getSystemStats()
      setStats(systemStats)
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system stats')
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 ** 3)
    return `${gb.toFixed(2)} GB`
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const runRepoHealing = async () => {
    try {
      setPythonOutput('Running repo healing task...')
      const result = await window.electronAPI.runPythonTask('repo_healing', [])
      setPythonOutput(result.stdout || result.stderr)
    } catch (err) {
      setPythonOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return <div className="app"><h1>Loading system stats...</h1></div>
  }

  if (error) {
    return <div className="app"><h1>Error: {error}</h1></div>
  }

  return (
    <div className="app">
      <h1>PSSI - System Intelligence</h1>
      <p className="subtitle">Pleading Sanity System Intelligence v0.1</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Platform</h3>
          <p>{stats?.platform}</p>
        </div>
        
        <div className="stat-card">
          <h3>Architecture</h3>
          <p>{stats?.arch}</p>
        </div>
        
        <div className="stat-card">
          <h3>CPU Cores</h3>
          <p>{stats?.cpus}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Memory</h3>
          <p>{stats ? formatBytes(stats.totalMemory) : 'N/A'}</p>
        </div>
        
        <div className="stat-card">
          <h3>Free Memory</h3>
          <p>{stats ? formatBytes(stats.freeMemory) : 'N/A'}</p>
        </div>
        
        <div className="stat-card">
          <h3>System Uptime</h3>
          <p>{stats ? formatUptime(stats.uptime) : 'N/A'}</p>
        </div>
        
        <div className="stat-card">
          <h3>Hostname</h3>
          <p>{stats?.hostname}</p>
        </div>
        
        <div className="stat-card">
          <h3>Node Version</h3>
          <p>{stats?.nodeVersion}</p>
        </div>
      </div>

      <div className="card">
        <h2>System Operations</h2>
        <button onClick={runRepoHealing}>Run Repo Healing</button>
        {pythonOutput && (
          <pre style={{ marginTop: '1rem', padding: '1rem', background: '#0d0d0d', borderRadius: '4px', overflow: 'auto' }}>
            {pythonOutput}
          </pre>
        )}
      </div>
    </div>
  )
}

export default App
