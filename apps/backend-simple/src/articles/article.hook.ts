import type {
  AuthorizableRequest,
  SubjectBeforeFilterHook,
} from '@jperezmart/nest-casl';
import { Injectable } from '@nestjs/common';

import type { Article } from './article.entity.js';
import { ArticlesService } from './articles.service.js';

/**
 * Subject hook: lazily loads the `Article` referenced by `:id` so the guard can
 * evaluate condition-based rules (e.g. `can('update', Article, { authorId })`)
 * against the real record. The result is cached on the request by the guard.
 */
@Injectable()
export class ArticleHook implements SubjectBeforeFilterHook<Article> {
  constructor(private readonly articles: ArticlesService) {}

  run(request: AuthorizableRequest): Article | undefined {
    const id = request.params?.['id'];
    return id ? this.articles.findById(id) : undefined;
  }
}
