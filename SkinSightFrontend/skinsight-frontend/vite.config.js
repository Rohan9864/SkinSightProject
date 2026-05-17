import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Keep port 3000 to match Spring Boot CORS config.
    // CorsConfig allows localhost:3000.
    // Changing port requires updating CorsConfig too.
  }
})