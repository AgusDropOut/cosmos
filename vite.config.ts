import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  base: './', 
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts',
    })
  ],
})