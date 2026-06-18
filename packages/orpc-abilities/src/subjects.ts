import type { InferSubjects, MongoAbility } from '@casl/ability';
import type { Article } from '@jperezmart/orpc-domain';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

/**
 * The CASL subjects: the `kind`-tagged `Article` shape plus its string tag
 * (`'Article'`, derived by `InferSubjects`) plus `'all'` for the superuser's
 * `manage all` rule.
 */
export type Subjects = InferSubjects<Article> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

/**
 * Resolve a subject's type from its `kind` field. Pass this identically on the
 * backend (`CaslModule.forRoot`) and the client (`createMongoAbility`) so
 * `ability.can('update', article)` works on raw JSON objects — no `subject()`
 * wrapper. Only ever called for object subjects.
 */
export const detectSubjectType = (subject: object): Article['kind'] =>
  (subject as Article).kind;
