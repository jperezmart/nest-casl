import type { AnyAbility, MongoAbility } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { CASL_ROOT_OPTIONS } from '../constants.js';
import type { AuthorizableUser } from '../interfaces/authorizable-user.interface.js';
import type { CaslModuleOptions } from '../interfaces/casl-options.interface.js';
import type {
  AppAbility,
  DefineRolePermissions,
  RolePermissions,
} from '../types.js';

type RulesCallback = DefineRolePermissions<AuthorizableUser, AnyAbility>;
type RolePermission = boolean | RulesCallback;

/**
 * Builds a CASL ability for a given user by running the permission definitions
 * aggregated from every `forFeature` registration. Exposed so consumers (and
 * the testing package) can build abilities outside the request lifecycle.
 */
@Injectable()
export class AbilityFactory<TAbility extends AppAbility = AppAbility> {
  /** role → permission definitions, merged across all registered features. */
  private readonly registry = new Map<string, RolePermission[]>();

  /**
   * Everyone permissions, merged across all registered features. Kept apart
   * from the Roles so a foreign Role named `everyone` never reaches them.
   */
  private readonly everyone: RulesCallback[] = [];

  constructor(
    @Inject(CASL_ROOT_OPTIONS)
    private readonly options: CaslModuleOptions,
  ) {}

  /** Merge a feature's Role permissions into the global registry. */
  registerPermissions<
    TUser extends AuthorizableUser = AuthorizableUser,
    TAbility extends AnyAbility = AnyAbility,
  >(permissions: RolePermissions<string, TUser, TAbility>): void {
    for (const [role, definition] of Object.entries(permissions)) {
      if (definition === undefined) continue;
      if (role === 'everyone') {
        // Only a callback: the types reject `everyone: true`, and an untyped
        // consumer who slips one through gets nothing rather than everything.
        if (typeof definition === 'function') {
          this.everyone.push(definition as RulesCallback);
        }
        continue;
      }
      const existing = this.registry.get(role) ?? [];
      existing.push(definition as RolePermission);
      this.registry.set(role, existing);
    }
  }

  /**
   * Create the ability for `user`: the Everyone permissions first, then every
   * registered role definition the user holds, so a Role can restrict what
   * everyone may do. Honours the configured superuser role.
   */
  createForUser<
    TUser extends AuthorizableUser = AuthorizableUser,
    TResult extends AppAbility = TAbility,
  >(user: TUser): TResult {
    const builder = new AbilityBuilder<MongoAbility>(createMongoAbility);
    const { superuserRole, detectSubjectType } = this.options;
    const buildOptions = detectSubjectType ? { detectSubjectType } : undefined;

    // Tolerate a user whose `roles` is missing or not an array (e.g. a JWT
    // payload without the claim): treat it as "no roles" → no Role permissions,
    // rather than throwing a TypeError that surfaces as a 500. Such a user
    // still gets the Everyone permissions.
    const roles: readonly string[] = Array.isArray(user.roles)
      ? user.roles
      : [];

    if (superuserRole !== undefined && roles.includes(superuserRole)) {
      builder.can('manage', 'all');
      return builder.build(buildOptions) as unknown as TResult;
    }

    const abilityBuilder = builder as unknown as AbilityBuilder<AnyAbility>;
    for (const definition of this.everyone) {
      definition(user, abilityBuilder);
    }

    for (const role of roles) {
      const definitions = this.registry.get(role);
      if (!definitions) continue;
      for (const definition of definitions) {
        if (definition === true) {
          builder.can('manage', 'all');
        } else if (typeof definition === 'function') {
          definition(user, abilityBuilder);
        }
      }
    }

    return builder.build(buildOptions) as unknown as TResult;
  }
}
