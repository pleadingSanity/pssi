import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: process.env.VITE_PUBLIC ? path.join(process.env.VITE_PUBLIC, 'electron-vite.svg') : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// IPC handlers
ipcMain.handle('get-system-stats', async () => {
  const os = await import('os')
  return {
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    hostname: os.hostname(),
    nodeVersion: process.version
  }
})

ipcMain.handle('run-python-task', async (_event, taskName: string, args: string[]) => {
  const { spawn } = await import('child_process')
  const appRoot = process.env.APP_ROOT || path.join(__dirname, '..')
  const pythonPath = path.join(appRoot, 'python', 'tasks', `${taskName}.py`)
  
  return new Promise((resolve, reject) => {
    const python = spawn('python', [pythonPath, ...args])
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
        reject(new Error(`Python task exited with code ${code}: ${stderr}`))
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
})
