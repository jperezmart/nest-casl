# example-rest

A working NestJS REST API showcasing `@jperezmart/nest-casl`.

## Run

```bash
pnpm --filter example-rest build   # or: pnpm --filter example-rest dev (watch)
pnpm --filter example-rest start   # http://localhost:3000  (PORT to override)
```

## Demo "auth"

There is no real auth — the user is read from request headers so you can role-play
from curl or the React tester:

- `x-user-id`: one of `admin`, `alice`, `bob`, `carol`
- `x-user-roles`: comma-separated, e.g. `author`

## What it demonstrates

- `CaslModule.forRoot<Role>({ superuserRole: 'admin', getUserFromRequest })`
- `CaslModule.forFeature<Role, AppUser>({ permissions })` in `ArticlesModule`
- `@UseAbility(action, 'Article', ArticleHook)` on the controller
- A **subject hook** (`ArticleHook`) lazily loading the article so conditional
  rules (`{ authorId: user.id }`) are checked against the real record
- `@CaslSubject()` / `@CaslUser()` parameter decorators
- Using `AbilityFactory` directly to filter the list endpoint and to expose
  packed rules at `GET /me/abilities` for the frontend

## Endpoints

| Method | Path | Rule |
| --- | --- | --- |
| GET | `/articles` | filtered by each user's read ability |
| GET | `/articles/:id` | `read` (hook + conditions) |
| POST | `/articles` | `create` (authors only) |
| PATCH | `/articles/:id` | `update` (own only; admin bypasses) |
| DELETE | `/articles/:id` | `delete` (own only) |
| GET | `/me` · `/me/abilities` · `/users` | demo helpers |

## Quick check

```bash
# Carol (plain user) only reads published articles:
curl -s -H 'x-user-id: carol' -H 'x-user-roles: user' localhost:3000/articles
# Carol cannot create → 403:
curl -s -X POST -H 'x-user-id: carol' -H 'x-user-roles: user' \
  -H 'content-type: application/json' -d '{"title":"x"}' localhost:3000/articles
```
