import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // 환경에 따른 base 경로 설정
  // 개발: '/' | 프로덕션(GitHub Pages): '/ssu-run/'
  base: mode === 'production' ? '/ssu-run/' : '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
}))