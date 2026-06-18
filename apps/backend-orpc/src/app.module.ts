import { CaslModule } from '@jperezmart/nest-casl';
import { detectSubjectType } from '@jperezmart/orpc-abilities';
import type { Role } from '@jperezmart/orpc-domain';
import { Module } from '@nestjs/common';
import { onError, ORPCModule } from '@orpc/nest';

import { ArticlesModule } from './articles/articles.module.js';
import { MeModule } from './me/me.module.js';

@Module({
  imports: [
    // Mounts the oRPC interceptor that executes @Implement handlers. We do NOT
    // need its `context` option: the user is read per request via @Req().
    ORPCModule.forRoot({
      interceptors: [
        onError((error: unknown) => {
          console.error('[orpc]', error);
        }),
      ],
    }),
    // No `getUserFromRequest` here — that feeds the REST AccessGuard, which this
    // example bypasses. `detectSubjectType` lets the factory match `kind` objects.
    CaslModule.forRoot<Role>({ superuserRole: 'admin', detectSubjectType }),
    ArticlesModule,
    MeModule,
  ],
})
export class AppModule {}
