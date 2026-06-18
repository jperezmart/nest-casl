import type { AppUser } from '@jperezmart/orpc-domain';

/**
 * Demo "auth" — NOT real authentication. A request identifies itself with an
 * `x-user-id` header; the user's roles come from this fixed list. In a real app
 * a JWT/session guard would populate the user instead.
 */
export const DEMO_USERS: AppUser[] = [
  { id: 'admin', name: 'Admin', roles: ['admin'] },
  { id: 'alice', name: 'Alice (author)', roles: ['author'] },
  { id: 'bob', name: 'Bob (author)', roles: ['author'] },
  { id: 'carol', name: 'Carol (user)', roles: ['user'] },
];

export function parseUser(request: {
  headers?: Record<string, unknown>;
}): AppUser | undefined {
  const header = request.headers?.['x-user-id'];
  const id = typeof header === 'string' ? header : undefined;
  if (!id) return undefined;
  return DEMO_USERS.find(user => user.id === id);
}
