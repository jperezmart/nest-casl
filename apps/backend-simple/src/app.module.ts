import { CaslModule } from '@jperezmart/nest-casl';
import { Module } from '@nestjs/common';

import { detectSubjectType } from './articles/article.entity.js';
import { ArticlesModule } from './articles/articles.module.js';
import type { Role } from './auth/user.js';
import { parseUser } from './auth/user.js';
import { MeModule } from './me/me.module.js';

@Module({
  imports: [
    CaslModule.forRoot<Role>({
      superuserRole: 'admin',
      getUserFromRequest: request =>
        parseUser(request as { headers?: Record<string, unknown> }),
      // Resolve subject types from the `kind` discriminator on plain objects.
      detectSubjectType,
    }),
    ArticlesModule,
    MeModule,
  ],
})
export class AppModule {}
