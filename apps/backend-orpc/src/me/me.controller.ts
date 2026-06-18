import { packRules } from '@casl/ability/extra';
import { AbilityFactory } from '@jperezmart/nest-casl';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import { Controller, Req } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

import { parseUser } from '../auth/parse-user.js';

type ReqLike = { headers?: Record<string, unknown> };

/**
 * `me` has no per-procedure subject to gate, so the grouped `@Implement` form
 * fits: read the user with `@Req()` + `parseUser`, build the ability with the
 * (typed) `AbilityFactory`. `me.abilities` ships the packed rules so the React
 * app can rebuild the same ability — server is the source of truth.
 */
@Controller()
export class MeController {
  constructor(private readonly factory: AbilityFactory<AppAbility>) {}

  @Implement(contract.me)
  me(@Req() req: ReqLike) {
    const user = parseUser(req);
    return {
      get: implement(contract.me.get).handler(() => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return user;
      }),
      abilities: implement(contract.me.abilities).handler(() => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return {
          user,
          rules: packRules(this.factory.createForUser(user).rules),
        };
      }),
    };
  }
}
