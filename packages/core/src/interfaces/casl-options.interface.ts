import type { AnyAbility } from "@casl/ability";
import type { ModuleMetadata } from "@nestjs/common";

import type { AppAbility, Permissions } from "../types.js";
import type { AuthorizableRequest } from "./authorizable-request.interface.js";
import type { AuthorizableUser } from "./authorizable-user.interface.js";

/**
 * Global configuration passed to `CaslModule.forRoot`.
 *
 * @typeParam Roles    - String union of role names used across the app.
 * @typeParam TUser    - Authenticated user shape.
 * @typeParam TRequest - Incoming request shape.
 */
export interface CaslModuleOptions<
  Roles extends string = string,
  TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
  TRequest extends AuthorizableRequest<TUser> = AuthorizableRequest<TUser>,
> {
  /**
   * Role that bypasses all permission checks. When the user has this role the
   * guard short-circuits to "allow".
   */
  superuserRole?: Roles;

  /**
   * Extracts the authenticated user from the request. Defaults to reading
   * `request.user` (as populated by most NestJS auth strategies).
   */
  getUserFromRequest?: (request: TRequest) => TUser | undefined;
}

/**
 * Async variant of {@link CaslModuleOptions} for `CaslModule.forRootAsync`,
 * letting options depend on other providers (config service, etc.).
 */
export interface CaslModuleAsyncOptions<
  Roles extends string = string,
  TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
  TRequest extends AuthorizableRequest<TUser> = AuthorizableRequest<TUser>,
> extends Pick<ModuleMetadata, "imports"> {
  inject?: unknown[];
  useFactory: (
    ...args: never[]
  ) =>
    | Promise<CaslModuleOptions<Roles, TUser, TRequest>>
    | CaslModuleOptions<Roles, TUser, TRequest>;
}

/**
 * Per-feature configuration passed to `CaslModule.forFeature`. Each feature
 * module contributes its slice of permissions, aggregated globally at runtime.
 *
 * @typeParam Roles    - String union of role names.
 * @typeParam TUser    - Authenticated user shape.
 * @typeParam TAbility - CASL ability type.
 */
export interface CaslFeatureOptions<
  Roles extends string = string,
  TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
  TAbility extends AnyAbility = AppAbility,
> {
  /** Role → permission definitions contributed by this feature. */
  permissions: Permissions<Roles, TUser, TAbility>;
}
