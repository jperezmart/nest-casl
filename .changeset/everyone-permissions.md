---
'@jperezmart/nest-casl': minor
'@jperezmart/nest-casl-testing': minor
---

**Breaking (types only).** `CaslModule.forFeature` and `buildAbilityForTest` no longer take a role-union type argument, since inferring it would mistake `everyone` for a Role. Type the map with `RolePermissions<Role, …>` to check its keys, and drop the first type argument where you passed one: `forFeature<Role, User>(…)` becomes `forFeature<User>(…)`, or no type arguments at all.

Everyone permissions: a Role permissions map may carry an `everyone` entry, whose rules apply to every authenticated user, whatever Roles they hold — including none, or a missing `roles`.

```ts
const permissions: RolePermissions<Role, AppUser> = {
  everyone(user, { can }) {
    can('read', 'Article', { published: true });
  },
  banned(_user, { cannot }) {
    cannot('read', 'Article');
  },
};
```

- `everyone` takes a function only, with the same `(user, builder)` as a Role's. `everyone: true` and `everyone: false` do not compile.
- `everyone` cannot be a Role: `RolePermissions<'author' | 'everyone'>` does not compile, and a role literally named `everyone` on the user is ignored, so the rules apply once.
- The rules are laid down before any Role's, so a Role can restrict them with `cannot`.
- Every feature's `everyone` applies. The `superuserRole` still skips them all, and a request with no user is still a 401.
- `buildAbilityForTest` builds the same Ability.
