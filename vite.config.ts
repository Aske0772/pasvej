import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the app from /pasvej/; locally it is /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: { port: 5180 },
  test: { globals: true },
})
