import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl' // <— thêm

export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    https: true,       
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:44324',
        changeOrigin: true,
        secure: false
      },
    },
  },
})

