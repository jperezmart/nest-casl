# @jperezmart/nest-casl-testing

## 0.2.0

### Minor Changes

- [#9](https://github.com/jperezmart/nest-casl/pull/9) [`b759f2f`](https://github.com/jperezmart/nest-casl/commit/b759f2f62822c3edc3147322399c76dfa493f9e9) Thanks [@jperezmart](https://github.com/jperezmart)! - **Breaking (types only — nothing changes at runtime).** The types no longer assume what your user looks like.
  
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

### Patch Changes

- Updated dependencies [[`b759f2f`](https://github.com/jperezmart/nest-casl/commit/b759f2f62822c3edc3147322399c76dfa493f9e9)]:
  - @jperezmart/nest-casl@0.2.0

## 0.1.2

### Patch Changes

- [#7](https://github.com/jperezmart/nest-casl/pull/7) [`6f2f8e7`](https://github.com/jperezmart/nest-casl/commit/6f2f8e70a031bc00d8d1c9b1e0e9b43079387868) Thanks [@jperezmart](https://github.com/jperezmart)! - Add a README. The package shipped with none, so its npm page was blank — `npm view @jperezmart/nest-casl-testing readme` returned "No README data found!" despite `files` declaring one. Documents `buildAbilityForTest` and both of its options, with npm version and license badges.

## 0.1.1

### Patch Changes

- fc4c2a6: Add the missing `repository` field (with `directory: packages/testing`) to the
  package manifest. npm requires it to link a published tarball back to its source
  commit, so `0.1.0` shipped without a provenance attestation even though the
  release workflow already publishes via OIDC trusted publishing. The next publish
  carries provenance.
