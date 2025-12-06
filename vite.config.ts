import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages 배포용 - 리포지토리 이름으로 설정
  base: '/ssu-run/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
})