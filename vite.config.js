import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pages } from './src/navigation.js';

export default defineConfig({
  plugins: [react(), {
    name: 'static-document-pages',
    closeBundle() {
      // Real entry files allow direct links and refreshes on GitHub Pages.
      const html = readFileSync('dist/index.html', 'utf8');
      for (const page of pages) {
        const dir = resolve('dist', '.' + page.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), html);
      }
      writeFileSync('dist/404.html', html);
    },
  }],
  base: '/',
  // The remote workspace uses a shared filesystem; poll for reliable updates.
  server: { watch: { usePolling: true, interval: 500 } },
  build: { sourcemap: false },
});
