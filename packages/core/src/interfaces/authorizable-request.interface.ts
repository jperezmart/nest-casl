import type { AuthorizableUser } from "./authorizable-user.interface.js";

/**
 * The subset of the HTTP request the library reads from. Kept framework-light
 * (no hard dependency on Express/Fastify types) so either platform works.
 *
 * The resolved {@link CaslRequestContext} is stashed under a symbol key, hence
 * the index signature; consumers should not rely on it directly.
 */
export interface AuthorizableRequest<
  TUser extends AuthorizableUser = AuthorizableUser,
> {
  /** Populated by your auth layer; read by the default `getUserFromRequest`. */
  user?: TUser;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  [key: PropertyKey]: unknown;
}
