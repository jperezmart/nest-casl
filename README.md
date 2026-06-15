# nest-casl monorepo

Modern [CASL](https://casl.js.org) authorization for [NestJS](https://nestjs.com) — REST-focused, ESM + CJS, CASL v6.

## Why

Existing NestJS + CASL integrations are abandoned or stuck on `@casl/ability@^5`. This is a from-scratch, strictly-typed, REST-only take built for NestJS 10/11 and CASL 6.

## Packages

| Package                                    | Path                 | Description                                                                                       |
| ------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| [`@jperezmart/nest-casl`](./packages/core) | `packages/core`      | The core module: `CaslModule`, `AccessGuard`, `@UseAbility`, subject hooks, parameter decorators. |
| `@jperezmart/nest-casl-testing`            | `packages/testing`   | Helpers to unit-test ability definitions without booting Nest.                                    |
| [`example-rest`](./apps/example-rest)      | `apps/example-rest`  | Working NestJS REST API using the package.                                                        |
| [`example-react`](./apps/example-react)    | `apps/example-react` | Vite + React tester using `@casl/react` against the API.                                          |

## Try it end-to-end

```bash
pnpm install
pnpm --filter example-rest build && pnpm --filter example-rest start  # :3000
pnpm --filter example-react dev                                       # :5173
```

Open http://localhost:5173, switch between users, and watch the UI gating and the
REST responses stay in sync with the same CASL rules.

## Develop

```bash
pnpm install
pnpm build       # turbo run build
pnpm test        # turbo run test
pnpm typecheck   # turbo run typecheck
```

Tooling: **pnpm** workspaces, **Turborepo**, **tsdown** (dual ESM/CJS, via rolldown/oxc), **Vitest**, strict **TypeScript**.

> Status: core implemented; verified end-to-end by the example apps. Test suite next.
