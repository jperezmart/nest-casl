# @jperezmart/nest-casl-testing

[![npm version](https://img.shields.io/npm/v/@jperezmart/nest-casl-testing.svg)](https://www.npmjs.com/package/@jperezmart/nest-casl-testing)
[![license](https://img.shields.io/npm/l/@jperezmart/nest-casl-testing.svg)](./LICENSE)

Testing utilities for [`@jperezmart/nest-casl`](https://github.com/jperezmart/nest-casl/tree/main/packages/core).
Build a CASL ability straight from a permissions map and a user, so permission
definitions can be unit-tested without booting a Nest application.

## Install

```bash
pnpm add -D @jperezmart/nest-casl-testing
```

`@casl/ability` and `@jperezmart/nest-casl` are peer dependencies.

## `buildAbilityForTest(permissions, user, options?)`

Takes the same `permissions` map you pass to `CaslModule.forFeature` and the
user you would otherwise have to authenticate, and returns the ability CASL
would have built:

```ts
import { buildAbilityForTest } from '@jperezmart/nest-casl-testing';
import { subject } from '@casl/ability';

const permissions = {
  author: (user, { can }) => {
    can('read', 'Article');
    can('update', 'Article', { authorId: user.id });
  },
};

const ability = buildAbilityForTest(permissions, {
  id: '1',
  roles: ['author'],
});

expect(ability.can('read', 'Article')).toBe(true);
expect(ability.can('update', subject('Article', { authorId: '1' }))).toBe(true);
expect(ability.can('update', subject('Article', { authorId: '2' }))).toBe(
  false,
);
```

### Options

Both mirror `CaslModule.forRoot`, so a test builds the same ability the running
application would:

| Option              | Type                          | Effect                                                                               |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `superuserRole`     | `string`                      | A user holding this role gets `can('manage', 'all')` and no other rule is evaluated. |
| `detectSubjectType` | `(subject: object) => string` | Custom subject-type detection, for subjects CASL cannot name on its own.             |

A role whose definition is `true` rather than a function also grants
`manage all`. A user whose `roles` is missing or not an array is treated as
having no roles, which is what `AbilityFactory` does.

## License

MIT
