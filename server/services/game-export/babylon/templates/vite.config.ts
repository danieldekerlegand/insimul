import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
    },
  },
  esbuild: {
    loader: 'ts',
    target: 'esnext',
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
    copyPublicDir: true,
    assetsDir: 'assets',
  },
  optimizeDeps: {
    include: [
      '@babylonjs/core',
      '@babylonjs/gui',
      '@babylonjs/loaders',
      '@babylonjs/materials',
    ],
  },
  publicDir: 'public',
});
