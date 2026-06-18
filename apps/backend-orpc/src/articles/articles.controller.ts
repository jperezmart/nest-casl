import { assertCan, ensureAbility, OrpcCasl } from '@jperezmart/nest-casl/orpc';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Controller, Req } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

import { ArticlesStore } from './articles.store.js';

// Minimal request shape we read from (just headers, for the demo auth).
type ReqLike = { headers?: Record<string, unknown> };

/**
 * The CASL ↔ oRPC bridge, using the library's `@jperezmart/nest-casl/orpc`
 * helper. `OrpcCasl.forRequest` resolves the user (via the `getUserFromRequest`
 * configured in `CaslModule.forRoot`) and builds their ability; `assertCan` /
 * `ensureAbility` throw the right oRPC error (UNAUTHORIZED / FORBIDDEN). We do
 * NOT use `@UseAbility`/`AccessGuard`: one `@Implement` method groups several
 * procedures under a single Nest handler, so per-procedure metadata is
 * impossible. `@Req()` works because `@Implement` copies the method's param
 * metadata onto the generated per-procedure methods.
 */
@Controller()
export class ArticlesController {
  constructor(
    private readonly casl: OrpcCasl,
    private readonly store: ArticlesStore,
  ) {}

  @Implement(contract.articles)
  articles(@Req() req: ReqLike) {
    const { user, ability } = this.casl.forRequest<AppUser, AppAbility>(req);

    return {
      // Server-side filtering by the read ability — a plain user never receives
      // other people's drafts (mirrors the REST `list`).
      list: implement(contract.articles.list).handler(async () => {
        const can = ensureAbility(ability);
        return this.store.findAll().filter(a => can.can('read', a));
      }),

      get: implement(contract.articles.get).handler(async ({ input }) => {
        const article = this.store.findById(input.id);
        if (!article) throw new ORPCError('NOT_FOUND');
        assertCan(ability, 'read', article);
        return article;
      }),

      create: implement(contract.articles.create).handler(async ({ input }) => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        assertCan(ability, 'create', 'Article'); // no instance yet — type-level
        return this.store.create(input, user.id);
      }),

      update: implement(contract.articles.update).handler(async ({ input }) => {
        // Authorize against the SERVER-LOADED record, never client input.
        const { id, ...patch } = input;
        const existing = this.store.findById(id);
        if (!existing) throw new ORPCError('NOT_FOUND');
        assertCan(ability, 'update', existing);
        return this.store.update(id, patch) ?? existing;
      }),

      remove: implement(contract.articles.remove).handler(async ({ input }) => {
        const existing = this.store.findById(input.id);
        if (!existing) throw new ORPCError('NOT_FOUND');
        assertCan(ability, 'delete', existing);
        return this.store.remove(input.id);
      }),
    };
  }
}
