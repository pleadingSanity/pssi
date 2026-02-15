import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './app/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
  server: {
    port: 3000,
  },
});
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: resolve(__dirname, 'app/electron/main.ts'),
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: resolve(__dirname, 'app/electron/preload.ts'),
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist-electron')
          }
        }
      }
    ]),
    renderer()
  ],
  root: resolve(__dirname, 'app/renderer'),
  build: {
    outDir: resolve(__dirname, 'dist')
  },
  server: {
    port: 5173
  }
})
