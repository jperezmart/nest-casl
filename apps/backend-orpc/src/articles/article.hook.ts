import type {
  AuthorizableRequest,
  SubjectBeforeFilterHook,
} from '@jperezmart/nest-casl';
import type { Article } from '@jperezmart/orpc-domain';
import { Injectable } from '@nestjs/common';

import { ArticlesStore } from './articles.store.js';

/**
 * Loads the `Article` referenced by the `:id` route param so the guard can
 * evaluate conditional rules (e.g. `can('update', Article, { authorId })`)
 * against the real record. Works the same over oRPC: with the per-procedure
 * `@Implement` form, `@orpc/nest` maps `/articles/{id}` to a Nest route, so
 * `request.params.id` is populated before the guard runs.
 */
@Injectable()
export class ArticleHook implements SubjectBeforeFilterHook<Article> {
  constructor(private readonly articles: ArticlesStore) {}

  run(request: AuthorizableRequest): Article | undefined {
    const id = request.params?.['id'];
    return id ? this.articles.findById(id) : undefined;
  }
}
