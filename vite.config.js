import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL for GitHub Pages deployment
  // Change this to '/' if deploying to a custom domain
  // or to '/repo-name/' if deploying to GitHub Pages
  base: '/kaienv/',
})
