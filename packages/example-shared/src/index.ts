// Client-safe barrel — depends only on @casl/ability, so the frontend can import
// the shared types and ability helpers without pulling in nest-casl. The
// permission definitions and demo auth live in the `./server` entry instead.

export type { PackedRules } from './ability.js';
export { buildAbilityFromPackedRules, createEmptyAbility } from './ability.js';
export type { Role } from './roles.js';
export type { Action, AppAbility, Article, Subjects } from './subjects.js';
export { detectSubjectType } from './subjects.js';
