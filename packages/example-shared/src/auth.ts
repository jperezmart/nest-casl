import type { Role } from './roles.js';
import { ROLES } from './roles.js';

/**
 * The authenticated user shape, shared by both backends. Framework-agnostic on
 * purpose — it just needs `id` + `roles`, which structurally satisfies
 * nest-casl's `AuthorizableUser` without importing it.
 */
export interface AppUser {
  id: string;
  name: string;
  roles: Role[];
}

/** Sample users the frontend can switch between. */
export const DEMO_USERS: AppUser[] = [
  { id: 'admin', name: 'Admin', roles: ['admin'] },
  { id: 'alice', name: 'Alice (author)', roles: ['author'] },
  { id: 'bob', name: 'Bob (author)', roles: ['author'] },
  { id: 'carol', name: 'Carol (user)', roles: ['user'] },
];

/**
 * Demo "auth": resolve the user from `x-user-id` / `x-user-roles` headers.
 * A real app would use a JWT/session strategy that populates `request.user`.
 */
export function parseUser(request: {
  headers?: Record<string, unknown>;
}): AppUser | undefined {
  const headers = request.headers ?? {};
  const id =
    typeof headers['x-user-id'] === 'string' ? headers['x-user-id'] : undefined;
  if (!id) return undefined;

  const rawRoles = headers['x-user-roles'];
  const roles = (typeof rawRoles === 'string' ? rawRoles.split(',') : [])
    .map(role => role.trim())
    .filter((role): role is Role =>
      (ROLES as readonly string[]).includes(role),
    );

  const known = DEMO_USERS.find(user => user.id === id);
  return {
    id,
    name: known?.name ?? id,
    roles: roles.length ? roles : (known?.roles ?? []),
  };
}
