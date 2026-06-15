# @jperezmart/nest-casl

Modern [CASL](https://casl.js.org) authorization for [NestJS](https://nestjs.com). REST-focused, strictly typed, dual ESM/CJS, built for CASL v6 and NestJS 10/11.

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

> Status: implemented and exercised end-to-end by [`example-rest`](../../apps/example-rest) + [`example-react`](../../apps/example-react).
