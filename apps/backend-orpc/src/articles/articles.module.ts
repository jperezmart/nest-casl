import { CaslModule } from '@jperezmart/nest-casl';
import { OrpcCasl } from '@jperezmart/nest-casl/orpc';
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
  providers: [ArticlesStore, OrpcCasl],
})
export class ArticlesModule {}
