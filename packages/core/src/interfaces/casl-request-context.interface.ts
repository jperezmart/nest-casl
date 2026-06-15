import type { AnyAbility, Subject } from "@casl/ability";

import type { AppAbility } from "../types.js";
import type { AuthorizableUser } from "./authorizable-user.interface.js";
import type { ConditionsProxy } from "./conditions-proxy.interface.js";

/**
 * The CASL context the {@link AccessGuard} resolves once per request and caches
 * on the request object. Parameter decorators read from this bag.
 *
 * @typeParam TUser    - Authenticated user shape.
 * @typeParam TAbility - Resolved CASL ability type.
 * @typeParam TSubject - Subject instance loaded by a subject hook, if any.
 */
export interface CaslRequestContext<
  TUser extends AuthorizableUser = AuthorizableUser,
  TAbility extends AnyAbility = AppAbility,
  TSubject extends Subject = Subject,
> {
  /** The authenticated user resolved via `getUserFromRequest`. */
  user: TUser;

  /** The ability built for this user from the aggregated permissions. */
  ability: TAbility;

  /** Conditions of the rule that matched the guarded `(action, subject)`. */
  conditions: ConditionsProxy;

  /** Subject instance produced by the route's subject hook, when present. */
  subject?: TSubject;
}
