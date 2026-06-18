import { packRules } from '@casl/ability/extra';
import type { AppAbility, PackedRules } from '@jperezmart/example-shared';
import type { AppUser } from '@jperezmart/example-shared/server';
import { DEMO_USERS } from '@jperezmart/example-shared/server';
import { AbilityFactory } from '@jperezmart/nest-casl';
import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller()
export class MeController {
  constructor(private readonly abilityFactory: AbilityFactory) {}

  /** The current demo user (from headers). */
  @Get('me')
  me(@CurrentUser() user: AppUser): AppUser {
    return user;
  }

  /**
   * The current user's packed CASL rules, ready to be rebuilt into an ability
   * on the frontend with `buildAbilityFromPackedRules` from the shared package.
   */
  @Get('me/abilities')
  abilities(@CurrentUser() user: AppUser): {
    user: AppUser;
    rules: PackedRules;
  } {
    const ability = this.abilityFactory.createForUser<AppUser, AppAbility>(
      user,
    );
    return { user, rules: packRules(ability.rules) };
  }

  /** Sample users the tester can switch between. */
  @Get('users')
  users(): AppUser[] {
    return DEMO_USERS;
  }
}
