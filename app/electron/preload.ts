import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
});

// API endpoint for backend
contextBridge.exposeInMainWorld('api', {
  baseURL: 'http://localhost:3001',
});
import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  runPythonTask: (taskName: string, args: string[]) => ipcRenderer.invoke('run-python-task', taskName, args),
  onMainProcessMessage: (callback: (value: string) => void) => ipcRenderer.on('main-process-message', (_event, value) => callback(value))
})
