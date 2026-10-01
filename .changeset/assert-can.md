---
'@jperezmart/nest-casl': minor
---

New `assertCan(ability, action, subject, options?)`: the guard's 404/403 decision as a plain function, for services, background jobs and grouped oRPC handlers — no guard, no dependency injection.

- Allowed → returns.
- Denied on a subject type (string or class) → `ForbiddenException`.
- Denied on an instance the user cannot read either → `NotFoundException`, with Nest's default message, so it looks like a genuine not-found.
- Any other denial → `ForbiddenException`.

The read action is `'read'` unless you pass `{ readAction }`. It is generic over the ability, so a typed `AppAbility` checks `action`, `subject` and `readAction`. The guard decides with it too (see the guard's own entry). See [ADR 0004](https://github.com/jperezmart/nest-casl/blob/main/docs/adr/0004-hide-what-the-user-cannot-read.md).
