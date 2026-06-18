import { CaslModule } from '@jperezmart/nest-casl';
import { articlesPermissions } from '@jperezmart/orpc-abilities';
import type { AppUser, Role } from '@jperezmart/orpc-domain';
import { Module } from '@nestjs/common';

import { ArticlesController } from './articles.controller.js';
import { ArticlesStore } from './articles.store.js';

@Module({
  imports: [
    CaslModule.forFeature<Role, AppUser>({ permissions: articlesPermissions }),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesStore],
})
export class ArticlesModule {}
