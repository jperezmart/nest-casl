import { AbilityFactory } from '@jperezmart/nest-casl';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Controller, Req } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { parseUser } from '../auth/parse-user.js';
import { ArticlesStore } from './articles.store.js';

// Minimal request shape we read from (just headers, for the demo auth).
type ReqLike = { headers?: Record<string, unknown> };

/**
 * The CASL ↔ oRPC bridge, over the same `Article` domain as the REST examples.
 *
 * We deliberately do NOT use `@UseAbility`/`AccessGuard`: those are REST-shaped
 * (the guard reads metadata off a single Nest handler), but with `@orpc/nest`
 * one `@Implement(contract.branch)` method groups several procedures under one
 * Nest handler, so per-procedure metadata is impossible. Instead we authorize
 * inside each oRPC handler with `AbilityFactory.createForUser` — the public API
 * meant for building abilities outside the request lifecycle.
 *
 * `@Implement` copies this method's param metadata onto the per-procedure
 * methods it generates, so `@Req()` works: the method runs per request, we build
 * the ability once and the handlers close over it.
 */
@Controller()
export class ArticlesController {
  constructor(
    private readonly factory: AbilityFactory,
    private readonly store: ArticlesStore,
  ) {}

  @Implement(contract.articles)
  articles(@Req() req: ReqLike) {
    const user = parseUser(req);

    return {
      // Server-side filtering by the read ability — a plain user never receives
      // other people's drafts (mirrors the REST `list`).
      list: implement(contract.articles.list).handler(async ({ errors }) => {
        const ability = this.requireAbility(user, errors);
        return this.store.findAll().filter(a => ability.can('read', a));
      }),

      get: implement(contract.articles.get).handler(
        async ({ input, errors }) => {
          const ability = this.requireAbility(user, errors);
          const article = this.store.findById(input.id);
          if (!article) throw errors.NOT_FOUND();
          if (!ability.can('read', article)) throw errors.FORBIDDEN();
          return article;
        },
      ),

      create: implement(contract.articles.create).handler(
        async ({ input, errors }) => {
          if (!user) throw errors.UNAUTHORIZED();
          const ability = this.factory.createForUser<AppUser, AppAbility>(user);
          // No instance yet — authorize on the subject type.
          if (!ability.can('create', 'Article')) throw errors.FORBIDDEN();
          return this.store.create(input, user.id);
        },
      ),

      update: implement(contract.articles.update).handler(
        async ({ input, errors }) => {
          const ability = this.requireAbility(user, errors);
          // Authorize against the SERVER-LOADED record, never client input.
          const { id, ...patch } = input;
          const existing = this.store.findById(id);
          if (!existing) throw errors.NOT_FOUND();
          if (!ability.can('update', existing)) throw errors.FORBIDDEN();
          return this.store.update(id, patch) ?? existing;
        },
      ),

      remove: implement(contract.articles.remove).handler(
        async ({ input, errors }) => {
          const ability = this.requireAbility(user, errors);
          const existing = this.store.findById(input.id);
          if (!existing) throw errors.NOT_FOUND();
          if (!ability.can('delete', existing)) throw errors.FORBIDDEN();
          return this.store.remove(input.id);
        },
      ),
    };
  }

  /** Build the ability, or throw UNAUTHORIZED when there is no user. */
  private requireAbility(
    user: AppUser | undefined,
    errors: { UNAUTHORIZED: () => Error },
  ): AppAbility {
    if (!user) throw errors.UNAUTHORIZED();
    return this.factory.createForUser<AppUser, AppAbility>(user);
  }
}
