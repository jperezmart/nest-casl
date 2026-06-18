import { packRules } from '@casl/ability/extra';
import { ensureAbility, OrpcCasl } from '@jperezmart/nest-casl/orpc';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Controller, Req } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

type ReqLike = { headers?: Record<string, unknown> };

/**
 * `me.abilities` hands the client the packed CASL rules so the React app can
 * rebuild the same ability and drive `<Can>` — server is the source of truth.
 */
@Controller()
export class MeController {
  constructor(private readonly casl: OrpcCasl) {}

  @Implement(contract.me)
  me(@Req() req: ReqLike) {
    const { user, ability } = this.casl.forRequest<AppUser, AppAbility>(req);
    return {
      get: implement(contract.me.get).handler(async () => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return user;
      }),
      abilities: implement(contract.me.abilities).handler(async () => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return { user, rules: packRules(ensureAbility(ability).rules) };
      }),
    };
  }
}
