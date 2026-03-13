// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Для правильной работы в Docker
  server: {
    host: true, // слушаем все интерфейсы
    port: 5173,
  },
  preview: {
    host: true,
    port: 80,
  }
})