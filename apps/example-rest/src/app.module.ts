import { Module } from "@nestjs/common";
import { CaslModule } from "@jperezmart/nest-casl";

import { parseUser } from "./auth/user.js";
import type { Role } from "./auth/user.js";
import { ArticlesModule } from "./articles/articles.module.js";
import { MeModule } from "./me/me.module.js";

@Module({
  imports: [
    CaslModule.forRoot<Role>({
      superuserRole: "admin",
      getUserFromRequest: (request) =>
        parseUser(request as { headers?: Record<string, unknown> }),
    }),
    ArticlesModule,
    MeModule,
  ],
})
export class AppModule {}
