import type { AbilityBuilder, AnyAbility, AnyMongoAbility } from "@casl/ability";

import type { AuthorizableUser } from "./interfaces/authorizable-user.interface.js";

/** Plain object shape used for CASL conditions / subject instances. */
export type AnyObject = Record<PropertyKey, unknown>;

/**
 * Default ability type the module operates on when a consumer does not provide
 * its own. CASL's Mongo-flavoured ability is the standard choice for REST apps.
 */
export type AppAbility = AnyMongoAbility;

/**
 * A callback that declares the permissions of a single role by mutating the
 * CASL {@link AbilityBuilder}. Receives the authenticated user so rules can be
 * scoped (e.g. `can('update', Article, { authorId: user.id })`).
 */
export type DefinePermissions<
  TUser extends AuthorizableUser = AuthorizableUser,
  TAbility extends AnyAbility = AppAbility,
> = (user: TUser, builder: AbilityBuilder<TAbility>) => void;

/**
 * Map of role → permission definition. A `true` value grants the role full
 * access (delegates to the superuser fast-path); `false` grants nothing; a
 * {@link DefinePermissions} callback declares fine-grained rules.
 */
export type Permissions<
  Roles extends string = string,
  TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
  TAbility extends AnyAbility = AppAbility,
> = Partial<Record<Roles, boolean | DefinePermissions<TUser, TAbility>>>;
