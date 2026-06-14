import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the static build works from any folder on plain nginx
export default defineConfig({
  base: './',
  plugins: [react()],
})
