import type { Role } from '@jperezmart/example-shared';
import { detectSubjectType } from '@jperezmart/example-shared';
import { parseUser } from '@jperezmart/example-shared/server';
import { CaslModule } from '@jperezmart/nest-casl';
import { Module } from '@nestjs/common';

import { ArticlesModule } from './articles/articles.module.js';
import { MeModule } from './me/me.module.js';

@Module({
  imports: [
    CaslModule.forRoot<Role>({
      superuserRole: 'admin',
      getUserFromRequest: request =>
        parseUser(request as { headers?: Record<string, unknown> }),
      // Resolve subject types from the shared `kind` discriminator.
      detectSubjectType,
    }),
    ArticlesModule,
    MeModule,
  ],
})
export class AppModule {}
