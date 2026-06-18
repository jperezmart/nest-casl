import { CaslModule } from '@jperezmart/nest-casl';
import { articlesPermissions } from '@jperezmart/orpc-abilities';
import type { AppUser, Role } from '@jperezmart/orpc-domain';
import { Module } from '@nestjs/common';

import { ArticleHook } from './article.hook.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [
    CaslModule.forFeature<Role, AppUser>({ permissions: articlesPermissions }),
  ],
  controllers: [ArticlesController],
  // ArticleHook is a provider of THIS module so it can inject ArticlesService.
  providers: [ArticlesService, ArticleHook],
})
export class ArticlesModule {}
