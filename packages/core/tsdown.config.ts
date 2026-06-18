import { defineConfig } from 'tsdown';

export default defineConfig({
  // `./orpc` is a separate entry so non-oRPC consumers never pull in @orpc/server.
  entry: ['src/index.ts', 'src/orpc/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  platform: 'node',
  target: 'es2022',
  // Keep .js (ESM) + .cjs (CJS) to match the package.json `exports` map.
  fixedExtension: false,
  // `dependencies` and `peerDependencies` are auto-externalized by tsdown,
  // so @casl/ability, @nestjs/*, reflect-metadata and rxjs are never bundled.
});
