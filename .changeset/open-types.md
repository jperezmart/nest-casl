---
'@jperezmart/nest-casl': minor
'@jperezmart/nest-casl-testing': minor
---

**Breaking (types only — nothing changes at runtime).** The types no longer assume what your user looks like.

- `AuthorizableUser` is now `{ roles: readonly string[] }`. It has no type parameters and no `id`. The user may hold roles your app does not declare, e.g. every role a shared identity provider hands out. The library never read `id`. If your rules use it, declare it on your own user type.
- The role union types only the keys of the permissions map and the `superuserRole`.
- `CaslModule.forFeature` and `buildAbilityForTest` infer the role union, the user and the ability from `permissions`, so you no longer pass type arguments.
- `Permissions` is renamed to `RolePermissions`, and `DefinePermissions` to `DefineRolePermissions`. No aliases are kept.
- `CaslModuleAsyncOptions` types `inject` and `useFactory` the way Nest's own async modules do: `inject` takes injection tokens, and `useFactory` takes whatever they resolve to.
- `BuildAbilityForTestOptions` is no longer generic, and its `superuserRole` is a `string`.

Migrating:

```diff
- interface AppUser extends AuthorizableUser<Role, string> {
+ interface AppUser extends AuthorizableUser {
    id: string;
  }
- const permissions: Permissions<Role, AppUser> = { … };
+ const permissions: RolePermissions<Role, AppUser> = { … };
- CaslModule.forFeature<Role, AppUser>({ permissions });
+ CaslModule.forFeature({ permissions });
```
