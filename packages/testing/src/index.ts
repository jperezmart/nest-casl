import type { AnyAbility, MongoAbility } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type {
  AuthorizableUser,
  DefinePermissions,
  Permissions,
} from '@jperezmart/nest-casl';

/** Extra options accepted by {@link buildAbilityForTest}. */
export interface BuildAbilityForTestOptions<Roles extends string = string> {
  /** Role that bypasses all checks (mirrors `CaslModule.forRoot`). */
  superuserRole?: Roles;
}

/**
 * Build a CASL ability directly from a permissions map and a user, without
 * booting a Nest application. Intended for unit-testing permission definitions
 * in projects that consume `@jperezmart/nest-casl`.
 *
 * @example
 * ```ts
 * const ability = buildAbilityForTest(permissions, { id: "1", roles: ["author"] });
 * expect(ability.can("update", subject("Article", { authorId: "1" }))).toBe(true);
 * ```
 */
export function buildAbilityForTest<
  Roles extends string = string,
  TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
  TAbility extends AnyAbility = AnyAbility,
>(
  permissions: Permissions<Roles, TUser, TAbility>,
  user: TUser,
  options: BuildAbilityForTestOptions<Roles> = {},
): TAbility {
  const builder = new AbilityBuilder<MongoAbility>(createMongoAbility);

  if (
    options.superuserRole !== undefined &&
    (user.roles as string[]).includes(options.superuserRole)
  ) {
    builder.can('manage', 'all');
    return builder.build() as unknown as TAbility;
  }

  for (const role of user.roles) {
    const definition = (permissions as Record<string, unknown>)[role];
    if (definition === true) {
      builder.can('manage', 'all');
    } else if (typeof definition === 'function') {
      (definition as DefinePermissions<TUser, AnyAbility>)(
        user,
        builder as unknown as AbilityBuilder<AnyAbility>,
      );
    }
  }

  return builder.build() as unknown as TAbility;
}
