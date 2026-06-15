import type { SubjectType } from '@casl/ability';

import type { SubjectBeforeFilterTuple } from './subject-hook.interface.js';

/**
 * Authorization requirement attached to a handler by `@UseAbility`, read by the
 * {@link AccessGuard} at request time.
 */
export interface UseAbilityMetadata<TAction extends string = string> {
  /** The action being attempted (e.g. `'read'`, `'update'`, a custom verb). */
  action: TAction;

  /** The subject the action applies to: a class or a registered subject name. */
  subject: SubjectType;

  /** Optional hook to load the concrete subject before evaluating the rule. */
  subjectHook?: SubjectBeforeFilterTuple;
}
