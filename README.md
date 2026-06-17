# nest-casl monorepo

Modern [CASL](https://casl.js.org) authorization for [NestJS](https://nestjs.com) — REST-focused, ESM + CJS, CASL v7.

## Why

Existing NestJS + CASL integrations are abandoned or stuck on `@casl/ability@^5`. This is a from-scratch, strictly-typed, REST-only take built for NestJS 10/11 and CASL 7.

## Packages

| Package                                                   | Path                      | Description                                                                                       |
| --------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| [`@jperezmart/nest-casl`](./packages/core)                | `packages/core`           | The core module: `CaslModule`, `AccessGuard`, `@UseAbility`, subject hooks, parameter decorators. |
| `@jperezmart/nest-casl-testing`                           | `packages/testing`        | Helpers to unit-test ability definitions without booting Nest.                                    |
| [`@jperezmart/example-shared`](./packages/example-shared) | `packages/example-shared` | Shared roles, subjects, ability type and permission definitions used by the examples.            |
| [`backend-simple`](./apps/backend-simple)                 | `apps/backend-simple`     | NestJS REST API with permissions defined **inline** (Nest only).                                  |
| [`backend-shared`](./apps/backend-shared)                 | `apps/backend-shared`     | Same API, but roles/subjects/permissions **imported** from `@jperezmart/example-shared`.          |
| [`frontend`](./apps/frontend)                             | `apps/frontend`           | Vite + React tester using `@casl/react`; shares typing with the backends.                         |

## Two ways to feed `permissions`

`permissions` is just an object you pass to `CaslModule.forFeature`. The two
backends show the same API with that object coming from different places:

- **`backend-simple`** defines the permissions inline — the common "Nest only"
  case, nothing extra to set up.
- **`backend-shared`** imports them (plus the `Article` subject, `Role` and
  `AppUser`) from `@jperezmart/example-shared`. The `frontend` imports the
  **types** from that same package for compile-time-checked `<Can>`, while still
  hydrating the actual rules at runtime from `GET /me/abilities`.

Going from one to the other is moving an object from a local file into a shared
package — the library API doesn't change.

## Try it end-to-end

```bash
pnpm install
pnpm build                                          # build the package graph
pnpm --filter backend-shared start                  # :3000 (or backend-simple)
pnpm --filter frontend dev                          # :5173
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
