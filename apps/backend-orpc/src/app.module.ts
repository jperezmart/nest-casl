import { CaslModule } from '@jperezmart/nest-casl';
import { detectSubjectType } from '@jperezmart/orpc-abilities';
import type { Role } from '@jperezmart/orpc-domain';
import { Module } from '@nestjs/common';
import { onError, ORPCModule } from '@orpc/nest';

import { ArticlesModule } from './articles/articles.module.js';
import { parseUser } from './auth/parse-user.js';
import { MeModule } from './me/me.module.js';

@Module({
  imports: [
    // Mounts the oRPC interceptor that executes @Implement handlers.
    ORPCModule.forRoot({
      interceptors: [
        onError((error: unknown) => {
          console.error('[orpc]', error);
        }),
      ],
    }),
    // `getUserFromRequest` is read by `OrpcCasl.forRequest` (not by the REST
    // AccessGuard, which this example bypasses); `detectSubjectType` lets the
    // factory match `kind`-tagged objects.
    CaslModule.forRoot<Role>({
      superuserRole: 'admin',
      getUserFromRequest: request =>
        parseUser(request as { headers?: Record<string, unknown> }),
      detectSubjectType,
    }),
    ArticlesModule,
    MeModule,
  ],
})
export class AppModule {}
