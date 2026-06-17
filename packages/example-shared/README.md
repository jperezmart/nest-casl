# @jperezmart/example-shared

Shared CASL definitions consumed by the example apps. It exists to demonstrate
one design point of `@jperezmart/nest-casl`: **`permissions` is just an object
you pass in**, so going from "Nest only" to "Nest + frontend" is moving that
object from a local file into a shared package — the API doesn't change.

The package is **framework-agnostic** — it depends only on `@casl/ability`, not
on `@jperezmart/nest-casl`. The permission definitions are typed structurally so
`CaslModule.forFeature({ permissions })` accepts them by structural
compatibility. Two entry points split client- and server-side concerns:

| Import                                | Contents                                                      | Used by                   |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `@jperezmart/example-shared`          | `Role`, `Article`, `Action`/`Subjects`, `AppAbility`, `buildAbilityFromPackedRules`, `createEmptyAbility` | frontend **and** backends |
| `@jperezmart/example-shared/server`   | `AppUser`, `DEMO_USERS`, `parseUser`, `articlesPermissions`  | backends only             |

The default barrel gives the frontend the **shared typing** (`AppAbility`,
subjects) for `<Can>` and `ability.can(...)` while still hydrating the actual
rules at runtime from `GET /me/abilities` — the server stays the source of truth
for the rules.

See [`backend-shared`](../../apps/backend-shared) for the consumer, and
[`backend-simple`](../../apps/backend-simple) for the same app with the
permissions defined inline instead.
