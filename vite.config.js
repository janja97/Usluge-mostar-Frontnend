import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'emoji-picker'
      }
    }
  }
})
