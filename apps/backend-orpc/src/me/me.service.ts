import { packRules } from '@casl/ability/extra';
import { AbilityFactory } from '@jperezmart/nest-casl';
import type { AppAbility, PackedRules } from '@jperezmart/orpc-abilities';
import type { AppUser } from '@jperezmart/orpc-domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MeService {
  constructor(private readonly factory: AbilityFactory<AppAbility>) {}

  /**
   * The user's packed CASL rules, ready to be rebuilt into an ability on the
   * client with `buildAbilityFromPackedRules`.
   */
  abilitiesFor(user: AppUser): { user: AppUser; rules: PackedRules } {
    return { user, rules: packRules(this.factory.createForUser(user).rules) };
  }
}
