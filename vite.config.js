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
        const title = page.kind === 'landing' ? 'RoboValue — Fine-Grained Evaluation of Robotic Value Models' : `${page.kind === 'home' ? 'Documentation' : page.title} | RoboValue`;
        const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
        const url = new URL(page.path, 'https://robovalue-benchmark.github.io/').href;
        const pageHtml = html
          .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), pageHtml);
      }
      writeFileSync('dist/404.html', html);
    },
  }],
  base: '/',
  // The remote workspace uses a shared filesystem; poll for reliable updates.
  server: { watch: { usePolling: true, interval: 500 } },
  build: { sourcemap: false },
});
