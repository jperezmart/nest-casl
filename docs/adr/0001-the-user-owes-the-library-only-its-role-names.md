# The user owes the library only its role names

An Authorizable user is `{ roles: readonly string[] }` and nothing more. `roles` is plain strings, not the app's role union: a user from a shared identity provider (Keycloak handing out every app's roles) carries roles this app never declares, and a typed union made such a user fail to compile, forcing consumers down to `string` and losing the check where it matters. There is no `id` either: the library never reads one, and requiring it made consumers invent one. The role union types only the keys of the Role permissions and the `superuserRole`, which is where a misspelt role is actually a bug.

## Considered Options

- **Filtering the user's roles down to the declared ones** (in the rule callbacks, or on `@CaslUser()`), so handlers see the union. Rejected for now: the callbacks would get a copy of the user, not the user, and the handler has no single map to filter against without binding `forRoot` and `forFeature` types together. A consumer who wants the union narrows with a type guard of their own.
- **An optional or configurable `id`.** Rejected: optional makes every rule that reads it deal with `undefined`, and configurable is ceremony for a field the library does not use. Rules read whatever the consumer's own user type declares.

## Consequences

`user.roles.includes('admin')` is not checked against the union anywhere in the library. That check belongs to the consumer's code, if they want it.
