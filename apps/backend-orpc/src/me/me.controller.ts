import { contract } from '@jperezmart/orpc-contract';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { ORPCError } from '@orpc/server';

import { CurrentUser } from '../auth/current-user.decorator.js';
import { MeService } from './me.service.js';

/**
 * `me` has no per-procedure subject to gate, so the grouped `@Implement` form
 * fits. The controller stays thin: `@CurrentUser` resolves the user and
 * `MeService` does the work (`me.abilities` ships the packed rules so the React
 * app can rebuild the same ability — server is the source of truth).
 */
@Controller()
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Implement(contract.me)
  me(@CurrentUser() user: AppUser | undefined) {
    return {
      get: implement(contract.me.get).handler(() => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return user;
      }),
      abilities: implement(contract.me.abilities).handler(() => {
        if (!user) throw new ORPCError('UNAUTHORIZED');
        return this.meService.abilitiesFor(user);
      }),
    };
  }
}
