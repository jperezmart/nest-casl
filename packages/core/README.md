# @jperezmart/nest-casl

Modern [CASL](https://casl.js.org) authorization for [NestJS](https://nestjs.com). REST-focused, strictly typed, dual ESM/CJS, built for CASL v7 and NestJS 10/11.

## Install

```bash
pnpm add @jperezmart/nest-casl @casl/ability
```

Peer dependencies: `@nestjs/common`, `@nestjs/core`, `@casl/ability@^7`, `reflect-metadata`, `rxjs`.

## API surface

```ts
import {
  CaslModule,
  AccessGuard,
  AbilityFactory,
  UseAbility,
  CaslUser,
  CaslAbility,
  CaslConditions,
  CaslSubject,
  DefaultActions,
} from '@jperezmart/nest-casl';
import type {
  AuthorizableUser,
  AuthorizableRequest,
  CaslRequestContext,
  ConditionsProxy,
  SubjectBeforeFilterHook,
  CaslModuleOptions,
  CaslFeatureOptions,
  Permissions,
  DefinePermissions,
  AppAbility,
} from '@jperezmart/nest-casl';
```

### Planned usage

```ts
// app.module.ts
type Roles = 'admin' | 'author' | 'user';

@Module({
  imports: [
    CaslModule.forRoot<Roles>({
      superuserRole: 'admin',
      getUserFromRequest: req => req.user,
    }),
  ],
})
export class AppModule {}
```

```ts
// articles.module.ts
@Module({
  imports: [
    CaslModule.forFeature<Roles>({
      permissions: {
        author: (user, { can }) => {
          can('read', 'Article');
          can('update', 'Article', { authorId: user.id });
        },
      },
    }),
  ],
})
export class ArticlesModule {}
```

```ts
// articles.controller.ts
@UseGuards(AccessGuard)
@Controller('articles')
export class ArticlesController {
  @UseAbility(DefaultActions.update, 'Article', ArticleHook)
  @Patch(':id')
  update(@CaslSubject() article: Article, @CaslUser() user: AuthorizableUser) {}
}
```

## Typing your abilities

By default the module operates on `AppAbility` (CASL's `AnyMongoAbility`), which
is enough to be safe. To get full IDE hints and compile-time checks on actions,
subjects and conditions, define your own ability type and pass it as the
`TAbility` generic. For REST/JSON apps the cleanest approach is a `kind`-tagged
[discriminated union](https://casl.js.org/v7/en/advanced/typescript) of plain
objects — no classes needed:

```ts
import type { InferSubjects, MongoAbility } from '@casl/ability';

interface Article {
  readonly kind: 'Article';
  id: string;
  authorId: string;
  published: boolean;
}

type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<Article> | 'all'; // → Article | 'Article' | 'all'
export type AppAbility = MongoAbility<[Action, Subjects]>;
```

Then tell the module how to read that discriminator, so the guard, the factory
and the (frontend) ability all resolve subject types the same way:

```ts
// resolve the subject type from `kind`; only called for object subjects
const detectSubjectType = (subject: object) => (subject as Article).kind;

CaslModule.forRoot<Role>({ superuserRole: 'admin', detectSubjectType });
```

`detectSubjectType` is forwarded to the built ability, so `ability.can('update', article)`
works with a raw `{ kind: 'Article', ... }` object — no `subject()` wrapper. On
the frontend pass the **same** function to `createMongoAbility(rules, { detectSubjectType })`.

`AbilityFactory` is generic over your ability — **type the injection once** and
every `createForUser` is typed (no per-call generic, no `AnyMongoAbility`):

```ts
constructor(private readonly abilityFactory: AbilityFactory<AppAbility>) {}
// ...
const ability = this.abilityFactory.createForUser(user); // typed AppAbility
ability.can('update', article); // `action` and `subject` are checked
```

The `@UseAbility` decorator accepts any string by default. Bind it to your
ability with `createUseAbility` (the analogue of `@casl/react`'s
`createContextualCan`) for type-checked `action` / `subject`:

```ts
// casl.ts
export const UseAbility = createUseAbility<AppAbility>();

// @UseAbility('update', 'Article', ArticleHook)  ✓
// @UseAbility('frobnicate', 'Ghost')             ✗ compile error
```

- Include `'manage'` / `'all'` in the unions if you use a `superuserRole` —
  otherwise `RawRuleOf<AppAbility>` can't represent the `manage`/`all` rule the
  guard generates for superusers.
- `InferSubjects` derives the string tag (`'Article'`) from the `kind`/`__typename`
  field (or a class with a static custom name) — for a **plain class** it can't,
  so list `Article | 'Article'` explicitly there.

> **Prefer `kind` over class names.** Without a custom `detectSubjectType`, CASL
> falls back to `subject.constructor.modelName || subject.constructor.name`. That
> breaks for plain POJOs (constructor is `Object`) and for **minified** class
> code (the name is mangled). The `kind` discriminator above sidesteps both; if
> you do use classes, add a `static modelName = 'Article'` or wrap objects with
> CASL's `subject('Article', obj)` helper.

## Beyond REST: oRPC

[oRPC](https://orpc.dev) (`@orpc/nest`) implements a contract two ways, and
nest-casl works with **both using only its core API** — no oRPC-specific package:

- **Per-procedure** — `@Implement(contract.articles.get)` on its own method.
  Each procedure is a normal Nest handler, so `@UseAbility` + `@CaslAbility` /
  `@CaslUser` work as-is. Use `@UseAbility` as the coarse role/action gate (it also
  injects the ability), and do the per-record check **inside the handler against
  the validated `input`** — don't use a subject hook here, since the guard runs
  before oRPC has parsed the request (it would read raw `req.params`):

  ```ts
  @Implement(contract.articles.get)
  @UseAbility('read', 'Article') // coarse gate + injects the ability
  get(@CaslAbility() ability: AppAbility) {
    return implement(contract.articles.get).handler(({ input }) => {
      const article = this.articles.findById(input.id); // validated input
      if (!article) throw new ORPCError('NOT_FOUND'); // a real 404
      if (ability.cannot('read', article)) throw new ORPCError('FORBIDDEN');
      return article;
    });
  }
  ```

- **Grouped** — `@Implement(contract.articles)` returns a map of handlers under
  one Nest handler, so `@UseAbility` can't target individual procedures. Read the
  user from the request (`@Req()`) and build the ability inline with the (generic)
  `AbilityFactory`:

  ```ts
  @Implement(contract.me)
  me(@Req() req: Request) {
    const user = parseUser(req);
    return {
      get: implement(contract.me.get).handler(() => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return user;
      }),
    };
  }
  ```

Either way, authorize against the **server-loaded** record, never client input.

> Status: implemented and exercised end-to-end by [`backend-simple`](../../apps/backend-simple) / [`backend-shared`](../../apps/backend-shared) + [`frontend`](../../apps/frontend) (REST) and [`backend-orpc`](../../apps/backend-orpc) + [`frontend-orpc`](../../apps/frontend-orpc) (oRPC).
