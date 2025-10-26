import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Add API methods here as needed
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
});
