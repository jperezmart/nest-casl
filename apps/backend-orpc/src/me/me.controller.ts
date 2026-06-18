import { packRules } from '@casl/ability/extra';
import { AbilityFactory } from '@jperezmart/nest-casl';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Controller, Req } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { parseUser } from '../auth/parse-user.js';

type ReqLike = { headers?: Record<string, unknown> };

/**
 * `me.abilities` hands the client the packed CASL rules so the React app can
 * rebuild the same ability and drive `<Can>` — server is the source of truth.
 */
@Controller()
export class MeController {
  constructor(private readonly factory: AbilityFactory) {}

  @Implement(contract.me)
  me(@Req() req: ReqLike) {
    const user = parseUser(req);
    return {
      get: implement(contract.me.get).handler(async ({ errors }) => {
        if (!user) throw errors.UNAUTHORIZED();
        return user;
      }),
      abilities: implement(contract.me.abilities).handler(
        async ({ errors }) => {
          if (!user) throw errors.UNAUTHORIZED();
          const ability = this.factory.createForUser<AppUser, AppAbility>(user);
          return { user, rules: packRules(ability.rules) };
        },
      ),
    };
  }
}
