import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pages } from './src/navigation.js';

// This JSON contains only intentionally public browser configuration.
// Production never falls back to the local frontend-only preview.
function productionEvalDefinitions() {
  let value;
  try {
    const raw = readFileSync(new URL('./eval-public-config.json', import.meta.url), 'utf8');
    if (Buffer.byteLength(raw) > 16384) throw new Error('Oversized public configuration.');
    value = JSON.parse(raw);
  } catch {
    throw new Error('PUBLIC_EVAL_CONFIG_MISSING_OR_INVALID');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).sort().join('|') !== 'env|keyType|publishableKey'
      || value.keyType !== 'publish_key' || value.env !== 'robovalue-eval-d6gvbrl7g1fa30d73'
      || typeof value.publishableKey !== 'string' || value.publishableKey.length < 20
      || value.publishableKey.length > 8192 || /[\s*]/.test(value.publishableKey)) {
    throw new Error('PUBLIC_EVAL_CONFIG_REQUIRES_EXACT_ENV_AND_PUBLISHABLE_KEY');
  }
  return {
    'import.meta.env.VITE_EVAL_SUBMISSION_MODE': JSON.stringify('cloudbase'),
    'import.meta.env.VITE_EVAL_CLOUDBASE_ENV': JSON.stringify(value.env),
    'import.meta.env.VITE_EVAL_CLOUDBASE_PUBLISHABLE_KEY': JSON.stringify(value.publishableKey),
  };
}

export default defineConfig(({ command }) => ({
  // Disable .env loading; private credentials are not build configuration.
  envDir: false,
  define: command === 'build' ? productionEvalDefinitions() : {},
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
  server: {
    watch: { usePolling: true, interval: 500 },
    proxy: {
      '/api/evaluation-applications': {
        target: 'http://127.0.0.1:8878',
        changeOrigin: false,
      },
    },
  },
  build: { sourcemap: false },
}));
