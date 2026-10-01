import type {
  AbilityBuilder,
  AbilityTuple,
  AnyAbility,
  AnyMongoAbility,
  Generics,
  SubjectType,
} from '@casl/ability';

import type { AuthorizableUser } from './interfaces/authorizable-user.interface.js';

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
export type DefineRolePermissions<
  TUser extends AuthorizableUser = AuthorizableUser,
  TAbility extends AnyAbility = AppAbility,
> = (user: TUser, builder: AbilityBuilder<TAbility>) => void;

/**
 * Rejects a role union that contains `everyone`: the key is reserved for the
 * Everyone permissions, so it can never name a Role. A plain `string` (no
 * union declared) is left alone.
 */
type EveryoneIsNotARole<Roles extends string> = string extends Roles
  ? unknown
  : 'everyone' extends Roles
    ? {
        readonly '`everyone` is reserved for the Everyone permissions and cannot be a Role': never;
      }
    : unknown;

/**
 * Map of role → permission definition. A `true` value grants the role full
 * access (delegates to the superuser fast-path); `false` grants nothing; a
 * {@link DefineRolePermissions} callback declares fine-grained rules.
 *
 * The `everyone` entry holds the Everyone permissions: rules for every
 * authenticated user, whatever Roles they hold (including none), laid down
 * before any Role's rules so a Role can restrict them with `cannot`. It only
 * takes a callback — `everyone: true` would open everything to everyone — and
 * `everyone` cannot be a Role.
 *
 * `Roles` types the keys only — the user's own `roles` stay plain strings.
 */
export type RolePermissions<
  Roles extends string = string,
  TUser extends AuthorizableUser = AuthorizableUser,
  TAbility extends AnyAbility = AppAbility,
> = Partial<Record<Roles, boolean | DefineRolePermissions<TUser, TAbility>>> & {
  everyone?: DefineRolePermissions<TUser, TAbility>;
} & EveryoneIsNotARole<Roles>;

type AbilitiesOf<T extends AnyAbility> = Generics<T>['abilities'];

/** The action union of an ability (falls back to `string` for loose abilities). */
export type ActionOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple ? AbilitiesOf<T>[0] : string;

/** The subject *type* union (string tags / classes) of an ability. */
export type SubjectTypeOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple
    ? Extract<AbilitiesOf<T>[1], SubjectType>
    : SubjectType;

/** Every subject an ability checks: its types and its instances. */
export type SubjectOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple ? AbilitiesOf<T>[1] : unknown;
