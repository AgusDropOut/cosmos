import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  base: './', 
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts',
      onstart(options) {
        /* Launches the Electron process only if CI is not active */
        if (process.env.CI === 'true') {
          console.log('Cosmos: Headless mode (CI) detected. Skipping window.');
          return;
        }
        options.startup();
      },
    })
  ],
})