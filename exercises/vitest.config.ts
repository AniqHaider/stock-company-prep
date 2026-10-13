import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// `bun test` runs YOUR stubs in src/. `bun test:solutions` runs the reference answers.
const impl = fileURLToPath(new URL(process.env.SOLUTIONS ? './solutions' : './src', import.meta.url));

export default defineConfig({ resolve: { alias: { '@impl': impl } } });
