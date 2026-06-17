// Server-side barrel — the demo auth and the nest-casl-typed permission
// definitions. Imported by the backends (which depend on nest-casl); the
// frontend never imports this entry.

export type { AppUser } from './auth.js';
export { DEMO_USERS, parseUser } from './auth.js';
export { articlesPermissions } from './permissions.js';
