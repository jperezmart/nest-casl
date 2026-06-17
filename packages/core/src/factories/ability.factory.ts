import type { AnyAbility, MongoAbility } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { CASL_ROOT_OPTIONS } from '../constants.js';
import type { AuthorizableUser } from '../interfaces/authorizable-user.interface.js';
import type { CaslModuleOptions } from '../interfaces/casl-options.interface.js';
import type { AppAbility, DefinePermissions, Permissions } from '../types.js';

type RolePermission = boolean | DefinePermissions<AuthorizableUser, AnyAbility>;

/**
 * Builds a CASL ability for a given user by running the permission definitions
 * aggregated from every `forFeature` registration. Exposed so consumers (and
 * the testing package) can build abilities outside the request lifecycle.
 */
@Injectable()
export class AbilityFactory {
  /** role → permission definitions, merged across all registered features. */
  private readonly registry = new Map<string, RolePermission[]>();

  constructor(
    @Inject(CASL_ROOT_OPTIONS)
    private readonly options: CaslModuleOptions,
  ) {}

  /** Merge a feature's permission map into the global registry. */
  registerPermissions(permissions: Permissions): void {
    for (const [role, definition] of Object.entries(permissions)) {
      if (definition === undefined) continue;
      const existing = this.registry.get(role) ?? [];
      existing.push(definition as RolePermission);
      this.registry.set(role, existing);
    }
  }

  /**
   * Create the ability for `user`, applying every registered role definition
   * the user holds. Honours the configured superuser role.
   */
  createForUser<
    TUser extends AuthorizableUser = AuthorizableUser,
    TAbility extends AppAbility = AppAbility,
  >(user: TUser): TAbility {
    const builder = new AbilityBuilder<MongoAbility>(createMongoAbility);
    const { superuserRole, detectSubjectType } = this.options;
    const buildOptions = detectSubjectType ? { detectSubjectType } : undefined;

    // Tolerate a user whose `roles` is missing or not an array (e.g. a JWT
    // payload without the claim): treat it as "no roles" → no permissions,
    // rather than throwing a TypeError that surfaces as a 500.
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];

    if (superuserRole !== undefined && roles.includes(superuserRole)) {
      builder.can('manage', 'all');
      return builder.build(buildOptions) as unknown as TAbility;
    }

    for (const role of roles) {
      const definitions = this.registry.get(role);
      if (!definitions) continue;
      for (const definition of definitions) {
        if (definition === true) {
          builder.can('manage', 'all');
        } else if (typeof definition === 'function') {
          definition(user, builder as unknown as AbilityBuilder<AnyAbility>);
        }
      }
    }

    return builder.build(buildOptions) as unknown as TAbility;
  }
}
