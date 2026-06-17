import type { Role } from '@jperezmart/example-shared';
import type { AppUser } from '@jperezmart/example-shared/server';
import { articlesPermissions } from '@jperezmart/example-shared/server';
import { CaslModule } from '@jperezmart/nest-casl';
import { Module } from '@nestjs/common';

import { ArticleHook } from './article.hook.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [
    // Same API as backend-simple's forFeature — the only difference is that
    // `permissions` is imported from the shared package instead of defined here.
    CaslModule.forFeature<Role, AppUser>({
      permissions: articlesPermissions,
    }),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleHook],
})
export class ArticlesModule {}
