import { defineConfig } from 'tsdown';

export default defineConfig({
  // Two entries: the default barrel is client-safe (CASL only), while `./server`
  // carries the nest-casl-typed permission definitions and demo auth.
  entry: ['src/index.ts', 'src/server.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  platform: 'neutral',
  target: 'es2022',
  // Keep .js (ESM) + .cjs (CJS) to match the package.json `exports` map.
  fixedExtension: false,
});
