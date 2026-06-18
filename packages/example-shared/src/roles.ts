/** Roles shared across the example backends and the frontend. */
export const ROLES = ['admin', 'author', 'user'] as const;

export type Role = (typeof ROLES)[number];
