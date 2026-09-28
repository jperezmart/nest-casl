/**
 * Minimal contract the library needs from an authenticated user: the names of
 * the roles whose permissions apply.
 *
 * Deliberately loose. `roles` is plain strings, not the app's role union: a
 * user from a shared identity provider carries roles other apps own, and those
 * are simply ignored. There is no identifier either — the library never reads
 * one. Consumers bring their own user shape; whatever their rules read (an
 * `id`, a tenant list…) lives on that shape.
 */
export interface AuthorizableUser {
  roles: readonly string[];
}
