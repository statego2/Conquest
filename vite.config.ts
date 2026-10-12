import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Source lives in index.source.html; root index.html is the compiled legacy
 * GitHub Pages artifact. Vite dev always serves the SOURCE file instead of
 * accidentally executing yesterday's shipped snapshot.
 */
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Conquest/' : '/',
  plugins: [{
    name: 'conquest-source-html-dev-router',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url=request.url ?? '';
        if(url==='/' || url==='/index.html' || url.startsWith('/index.html?')) {
          request.url='/index.source.html';
        }
        next();
      });
    }
  }],
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./index.source.html', import.meta.url))
    }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
