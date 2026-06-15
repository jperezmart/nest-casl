# example-react

A Vite + React tester for `@jperezmart/nest-casl`, using [`@casl/react`](https://casl.js.org/v6/en/package/casl-react).

It fetches the current user's **packed rules** from the backend (`GET /me/abilities`),
rebuilds a CASL ability on the client with `unpackRules` + `createMongoAbility`,
and gates the UI with `<Can>`. Clicking a button calls the guarded REST endpoint,
so you see the server agree (200/201) or reject (403) — the UI and the API share
the same rules.

## Run

Start the backend first, then this app:

```bash
pnpm --filter example-rest start     # http://localhost:3000
pnpm --filter example-react dev      # http://localhost:5173
```

Requests go to `/api/*` and Vite proxies them to the backend (see
[`vite.config.ts`](vite.config.ts)). Override the target with `API_TARGET`, or
hit a backend directly with `VITE_API_URL`.

## What to try

- Switch between **Admin / Alice / Bob / Carol** and watch the article list,
  the enabled buttons, and the packed-rules panel change.
- As **Carol** (plain user) only published articles load and every action is
  disabled. As an **author** you can edit _your own_ rows only. **Admin**
  (superuser) can do everything.
