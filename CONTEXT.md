# nest-casl

Authorization for NestJS on top of CASL: each feature declares what every Role may do, and the library turns the authenticated user into a CASL ability per request.

## Language

**Authorizable user**:
Whatever the app's auth layer puts on the request, as long as it carries the names of its Roles. Nothing else is required of it (no identifier), and it may hold Roles no Role permissions map declares.
_Avoid_: principal, identity

**Role**:
A name the Role permissions are keyed by. The user's Roles are plain strings; only the Roles an app declares in its Role permissions are typed.
_Avoid_: group, profile

**Role permissions**:
A map from Role to what that Role may do: `true` (everything), `false` (nothing) or a function that declares CASL rules for the user. Each feature contributes its own map, and the maps are merged.
_Avoid_: permissions (on its own), policy (in this repo), rules map

**Superuser role**:
The one Role that grants everything, skipping the Role permissions entirely.
_Avoid_: admin role

**Ability**:
The CASL object built for one user from every Role permissions entry of the Roles they hold. It is what guards and handlers ask "can this user do X?".
_Avoid_: permissions (for the built object)
