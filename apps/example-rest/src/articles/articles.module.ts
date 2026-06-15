import { Module } from "@nestjs/common";
import { CaslModule } from "@jperezmart/nest-casl";

import type { AppUser, Role } from "../auth/user.js";
import { ArticleHook } from "./article.hook.js";
import { ArticlesController } from "./articles.controller.js";
import { ArticlesService } from "./articles.service.js";
import { articlesPermissions } from "./articles.permissions.js";

@Module({
  imports: [
    CaslModule.forFeature<Role, AppUser>({
      permissions: articlesPermissions,
    }),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleHook],
})
export class ArticlesModule {}
