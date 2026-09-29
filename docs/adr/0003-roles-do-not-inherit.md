# Roles do not inherit from one another

There is no `extend(role)` inside a Role's permissions and no role hierarchy in `forRoot`, although the older `nest-casl` package offers the former. A Role's permissions are a plain function, so a Role that should include another's rules calls that function itself — explicit, local to the feature that wants it, and free of cycles to detect.

## Considered Options

- **`extend(role)` per feature, as upstream.** Rejected: the registry is merged across features, so it is ambiguous whether `extend('customer')` pulls in this feature's `customer` rules or every feature's.
- **A global `roleHierarchy` in `forRoot`.** Cheap to build (expand the user's Roles transitively, reject cycles at boot) and invisible to the frontend, which receives already-built rules. Rejected because it adds API surface for something function composition already expresses.
