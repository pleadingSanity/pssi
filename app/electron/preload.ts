import { contextBridge, ipcRenderer } from 'electron';
import * as os from 'os';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API proxy for server calls
  api: {
    get: async (path: string) => {
      const response = await fetch(`http://localhost:3001${path}`);
      return response.json();
    },
    post: async (path: string, data: any) => {
      const response = await fetch(`http://localhost:3001${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  // System stats
  system: {
    getStats: () => ({
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
    }),
  },
});
