import type { RawRuleOf } from '@casl/ability';
import type { PackRule } from '@casl/ability/extra';
import { packRules } from '@casl/ability/extra';
import { AbilityFactory } from '@jperezmart/nest-casl';
import { Controller, Get } from '@nestjs/common';

import type { AppAbility } from '../articles/article.entity.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AppUser } from '../auth/user.js';
import { DEMO_USERS } from '../auth/user.js';

@Controller()
export class MeController {
  constructor(private readonly abilityFactory: AbilityFactory<AppAbility>) {}

  /** The current demo user (from headers). */
  @Get('me')
  me(@CurrentUser() user: AppUser): AppUser {
    return user;
  }

  /**
   * The current user's packed CASL rules, ready to be `unpackRules`-ed and
   * rebuilt into an ability on the frontend with `@casl/react`.
   */
  @Get('me/abilities')
  abilities(@CurrentUser() user: AppUser): {
    user: AppUser;
    rules: PackRule<RawRuleOf<AppAbility>>[];
  } {
    const ability = this.abilityFactory.createForUser(user);
    return { user, rules: packRules(ability.rules) };
  }

  /** Sample users the tester can switch between. */
  @Get('users')
  users(): AppUser[] {
    return DEMO_USERS;
  }
}
