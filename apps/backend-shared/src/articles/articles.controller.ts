import type { AppAbility, Article } from '@jperezmart/example-shared';
import type { AppUser } from '@jperezmart/example-shared/server';
import {
  AbilityFactory,
  CaslSubject,
  CaslUser,
  UseAbility,
} from '@jperezmart/nest-casl';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import { ArticleHook } from './article.hook.js';
import { ArticlesService } from './articles.service.js';

interface ArticleBody {
  title: string;
  published?: boolean;
}

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articles: ArticlesService,
    // Typing the injected factory makes `createForUser(user)` return the typed
    // `AppAbility` (not the loose `AnyMongoAbility`) — no per-call generic.
    private readonly abilityFactory: AbilityFactory<AppAbility>,
  ) {}

  /**
   * List endpoint — builds the ability manually and filters in-memory, so it
   * works for users whose read access is conditional. Demonstrates using
   * `AbilityFactory` directly (no `@UseAbility`).
   */
  @Get()
  list(@CurrentUser() user: AppUser): Article[] {
    const ability = this.abilityFactory.createForUser(user);
    return this.articles
      .findAll()
      .filter(article => ability.can('read', article));
  }

  /** Read one — the hook loads the article so conditional read is enforced. */
  @Get(':id')
  @UseAbility('read', 'Article', ArticleHook)
  findOne(@CaslSubject() article: Article | undefined): Article {
    if (!article) throw new NotFoundException();
    return article;
  }

  /** Create — authors only (unconditional `create` rule); users get 403. */
  @Post()
  @UseAbility('create', 'Article')
  create(@Body() body: ArticleBody, @CaslUser() user: AppUser): Article {
    return this.articles.create(body, user.id);
  }

  /** Update — hook + conditional rule means authors can only edit their own. */
  @Patch(':id')
  @UseAbility('update', 'Article', ArticleHook)
  update(
    @CaslSubject() article: Article | undefined,
    @Body() body: Partial<ArticleBody>,
  ): Article {
    if (!article) throw new NotFoundException();
    return this.articles.update(article.id, body) ?? article;
  }

  /** Delete — same conditional ownership rule as update. */
  @Delete(':id')
  @UseAbility('delete', 'Article', ArticleHook)
  remove(
    @CaslSubject() article: Article | undefined,
    @Param('id') id: string,
  ): { deleted: boolean } {
    if (!article) throw new NotFoundException();
    return this.articles.remove(id);
  }
}
