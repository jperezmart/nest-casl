// Single source of truth: Zod schemas + inferred types. Depends on nothing but
// zod. Consumed by the contract (transport) and abilities (authorization)
// packages, which never import each other.

export type { Article, ArticleCreate, ArticleUpdate } from './article.js';
export {
  articleCreateSchema,
  articleSchema,
  articleUpdateSchema,
} from './article.js';
export type { Role } from './role.js';
export { roleSchema } from './role.js';
export type { AppUser } from './user.js';
export { appUserSchema } from './user.js';
