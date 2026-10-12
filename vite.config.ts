import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Conquest/' : '/',
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
