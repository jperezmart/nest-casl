# nest-casl monorepo

Modern [CASL](https://casl.js.org) authorization for [NestJS](https://nestjs.com) — REST-focused, ESM + CJS, CASL v7.

## Why

Existing NestJS + CASL integrations are abandoned or stuck on `@casl/ability@^5`. This is a from-scratch, strictly-typed, REST-only take built for NestJS 10/11 and CASL 7.

## Packages

| Package                                                   | Path                      | Description                                                                                       |
| --------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| [`@jperezmart/nest-casl`](./packages/core)                | `packages/core`           | The core module: `CaslModule`, `AccessGuard`, `@UseAbility`, subject hooks, parameter decorators. |
| `@jperezmart/nest-casl-testing`                           | `packages/testing`        | Helpers to unit-test ability definitions without booting Nest.                                    |
| [`@jperezmart/example-shared`](./packages/example-shared) | `packages/example-shared` | Shared roles, subjects, ability type and permission definitions used by the examples.             |
| [`backend-simple`](./apps/backend-simple)                 | `apps/backend-simple`     | NestJS REST API with permissions defined **inline** (Nest only).                                  |
| [`backend-shared`](./apps/backend-shared)                 | `apps/backend-shared`     | Same API, but roles/subjects/permissions **imported** from `@jperezmart/example-shared`.          |
| [`frontend`](./apps/frontend)                             | `apps/frontend`           | Vite + React tester using `@casl/react`; shares typing with the backends.                         |
| [`@jperezmart/orpc-domain`](./packages/orpc-domain)       | `packages/orpc-domain`    | oRPC example — Zod schemas + inferred types (single source of truth; no deps but zod).            |
| [`@jperezmart/orpc-contract`](./packages/orpc-contract)   | `packages/orpc-contract`  | oRPC example — the oRPC contract; depends only on `orpc-domain`.                                  |
| [`@jperezmart/orpc-abilities`](./packages/orpc-abilities) | `packages/orpc-abilities` | oRPC example — CASL roles/subjects/abilities/permissions; depends only on `orpc-domain`.          |
| [`backend-orpc`](./apps/backend-orpc)                     | `apps/backend-orpc`       | NestJS + `@orpc/nest`, authorizing oRPC procedures with nest-casl's `AbilityFactory` (in-memory). |
| [`frontend-orpc`](./apps/frontend-orpc)                   | `apps/frontend-orpc`      | Vite + React tester using a typed oRPC client + `@casl/react`.                                    |

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

## oRPC example (contract-first)

The `orpc-*` packages + `backend-orpc` + `frontend-orpc` show the **same library
working over [oRPC](https://orpc.dev) instead of REST** — nest-casl is
transport-agnostic. Architecture (strict, one-way deps):

```
orpc-domain     Zod schemas + types (source of truth, no deps but zod)
orpc-contract   oRPC contract        →  depends only on orpc-domain
orpc-abilities  CASL                 →  depends only on orpc-domain
backend-orpc    Nest + @orpc/nest + nest-casl (in-memory, no database)
frontend-orpc   typed oRPC client + @casl/react
```

`domain` depends on no one; `contract` and `abilities` depend only on `domain`,
never on each other. Subjects are `kind`-tagged plain objects resolved via
`detectSubjectType`; the frontend imports the typing but hydrates rules at
runtime from the `me.abilities` procedure.

**The CASL ↔ oRPC bridge** ([`articles.controller.ts`](./apps/backend-orpc/src/articles/articles.controller.ts)):
the REST `@UseAbility`/`AccessGuard` is **not** used here. With `@orpc/nest` one
`@Implement(contract.branch)` method groups several procedures under a single
Nest handler, so per-procedure metadata is impossible. Instead each oRPC handler
authorizes with `AbilityFactory.createForUser` — the public API for building
abilities outside the request lifecycle — checking `ability.can(action, record)`
against the **server-loaded** record (never the incoming body, which a client
could spoof). A future `@jperezmart/nest-casl/orpc` subpath could productize this
as a reusable middleware.

```bash
pnpm install
pnpm build
pnpm --filter backend-orpc dev     # :3002
pnpm --filter frontend-orpc dev    # :5174
```

## Develop

```bash
pnpm install
pnpm build       # turbo run build
pnpm test        # turbo run test
pnpm typecheck   # turbo run typecheck
```

Tooling: **pnpm** workspaces, **Turborepo**, **tsdown** (dual ESM/CJS, via rolldown/oxc), **Vitest**, strict **TypeScript**.

> Status: core implemented; verified end-to-end by the example apps. Test suite next.
