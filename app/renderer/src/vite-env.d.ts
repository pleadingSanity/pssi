/// <reference types="vite/client" />

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

export {}
