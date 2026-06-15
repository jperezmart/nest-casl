/**
 * Minimal contract the library needs from an authenticated user: an identifier
 * (used in scoped conditions) and the list of roles whose permissions apply.
 *
 * Consumers typically extend this with their own user shape.
 *
 * @typeParam Roles - String union of role names.
 * @typeParam Id    - Type of the user identifier (string, number, ObjectId…).
 */
export interface AuthorizableUser<Roles extends string = string, Id = unknown> {
  id: Id;
  roles: Roles[];
}
