import type { AppContract } from '@jperezmart/orpc-contract';
import { contract } from '@jperezmart/orpc-contract';
import type { Role } from '@jperezmart/orpc-domain';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

export interface DemoUser {
  id: string;
  name: string;
  roles: Role[];
}

/** Mirrors the backend's DEMO_USERS — the header `x-user-id` selects one. */
export const DEMO_USERS: DemoUser[] = [
  { id: 'admin', name: 'Admin', roles: ['admin'] },
  { id: 'alice', name: 'Alice (author)', roles: ['author'] },
  { id: 'bob', name: 'Bob (author)', roles: ['author'] },
  { id: 'carol', name: 'Carol (user)', roles: ['user'] },
];

export type AppClient = ContractRouterClient<AppContract>;

/**
 * Build a typed oRPC client for a given demo user. The contract carries the
 * `/api` prefix, so `url` is just the origin; Vite proxies `/api` to the backend.
 */
export function makeClient(user: DemoUser | null): AppClient {
  const link = new OpenAPILink(contract, {
    url: () => window.location.origin,
    headers: () => (user ? { 'x-user-id': user.id } : {}),
  });
  return createORPCClient<AppClient>(link);
}
