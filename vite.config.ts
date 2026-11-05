import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{target:'es2022',chunkSizeWarningLimit:1600,rollupOptions:{output:{manualChunks:{phaser:['phaser']}}}},server:{host:'0.0.0.0',watch:{ignored:['**/.cache/**','**/artifacts/**','**/test-results/**','**/playwright-report/**']}}});
