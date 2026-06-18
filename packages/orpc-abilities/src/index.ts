// CASL authorization for the example. Depends only on @jperezmart/orpc-domain
// (types) and @casl/ability — never on the contract or on nest-casl. The whole
// surface is client-safe, so the frontend imports it for typed `<Can>`.

export type { PackedRules } from './ability.js';
export { buildAbilityFromPackedRules, createEmptyAbility } from './ability.js';
export { articlesPermissions } from './permissions.js';
export type { Action, AppAbility, Subjects } from './subjects.js';
export { detectSubjectType } from './subjects.js';
