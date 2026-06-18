import { CaslAbility, CaslSubject, CaslUser } from '@jperezmart/nest-casl';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { AppUser, Article } from '@jperezmart/orpc-domain';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

import { UseAbility } from '../casl.js';
import { ArticleHook } from './article.hook.js';
import { ArticlesStore } from './articles.store.js';

/**
 * The CASL ↔ oRPC bridge using oRPC's **per-procedure** `@Implement` form: each
 * procedure is its own Nest handler, so nest-casl's REST decorators work exactly
 * as they do over HTTP — `@UseAbility` (its guard runs before the oRPC
 * interceptor, loading the subject via `ArticleHook`) plus `@CaslSubject` /
 * `@CaslUser` / `@CaslAbility` feeding the loaded values into the handler.
 *
 * Note: with `@UseAbility` + a hook, a missing record is denied by the guard
 * (403), not 404 — the guard is fail-closed when the hook yields no subject.
 */
@Controller()
export class ArticlesController {
  constructor(private readonly store: ArticlesStore) {}

  /** List — gated at the type level, then filtered by the (injected) ability. */
  @Implement(contract.articles.list)
  @UseAbility('read', 'Article')
  list(@CaslAbility() ability: AppAbility) {
    return implement(contract.articles.list).handler(() =>
      this.store.findAll().filter(article => ability.can('read', article)),
    );
  }

  /** Read one — the hook loads it and the guard checks `read` before we run. */
  @Implement(contract.articles.get)
  @UseAbility('read', 'Article', ArticleHook)
  get(@CaslSubject() article: Article | undefined) {
    return implement(contract.articles.get).handler(() => {
      if (!article) throw new ORPCError('NOT_FOUND');
      return article;
    });
  }

  /** Create — `create Article` is a type-level check; author comes from the user. */
  @Implement(contract.articles.create)
  @UseAbility('create', 'Article')
  create(@CaslUser() user: AppUser) {
    return implement(contract.articles.create).handler(({ input }) =>
      this.store.create(input, user.id),
    );
  }

  /** Update — the hook + conditional rule means authors edit only their own. */
  @Implement(contract.articles.update)
  @UseAbility('update', 'Article', ArticleHook)
  update(@CaslSubject() article: Article | undefined) {
    return implement(contract.articles.update).handler(({ input }) => {
      if (!article) throw new ORPCError('NOT_FOUND');
      const { id, ...patch } = input;
      return this.store.update(id, patch) ?? article;
    });
  }

  /** Delete — same conditional ownership rule as update. */
  @Implement(contract.articles.remove)
  @UseAbility('delete', 'Article', ArticleHook)
  remove() {
    return implement(contract.articles.remove).handler(({ input }) =>
      this.store.remove(input.id),
    );
  }
}
