import { CaslModule } from '@jperezmart/nest-casl';
import { Module } from '@nestjs/common';

import { ArticleHook } from './article.hook.js';
import { ArticlesController } from './articles.controller.js';
import { articlesPermissions } from './articles.permissions.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [CaslModule.forFeature({ permissions: articlesPermissions })],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleHook],
})
export class ArticlesModule {}
