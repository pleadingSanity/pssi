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
