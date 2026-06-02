import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,                           // FRONTEND PUERTO
    host: 'localhost',
    strictPort: true,                     // Falla si el puerto está ocupado
    open: false                           // No abre navegador automáticamente
  }
})
