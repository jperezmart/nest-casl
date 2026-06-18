import type {
  AbilityTuple,
  AnyAbility,
  Generics,
  SubjectType,
} from '@casl/ability';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { CASL_ABILITY_METADATA } from '../constants.js';
import { AccessGuard } from '../guards/access.guard.js';
import type { SubjectBeforeFilterTuple } from '../interfaces/subject-hook.interface.js';
import type { UseAbilityMetadata } from '../interfaces/use-ability-metadata.interface.js';

/**
 * Protects a route handler with a CASL permission check. Stores the requirement
 * as metadata and wires up the {@link AccessGuard} for the handler.
 *
 * @param action      - Action being attempted (string or action enum member).
 * @param subject     - Subject class or registered subject name.
 * @param subjectHook - Optional hook loading the concrete subject before the
 *                      rule is evaluated, enabling condition-based rules.
 *
 * @example
 * ```ts
 * @UseAbility(Actions.update, "Article", ArticleHook)
 * @Patch(":id")
 * update() {}
 * ```
 */
export function UseAbility<TAction extends string = string>(
  action: TAction,
  subject: SubjectType,
  subjectHook?: SubjectBeforeFilterTuple,
) {
  const metadata: UseAbilityMetadata<TAction> = {
    action,
    subject,
    ...(subjectHook ? { subjectHook } : {}),
  };
  return applyDecorators(
    SetMetadata(CASL_ABILITY_METADATA, metadata),
    UseGuards(AccessGuard),
  );
}

type AbilitiesOf<T extends AnyAbility> = Generics<T>['abilities'];

/** The action union of an ability (falls back to `string` for loose abilities). */
type ActionOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple ? AbilitiesOf<T>[0] : string;

/** The subject *type* union (string tags / classes) of an ability. */
type SubjectOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple
    ? Extract<AbilitiesOf<T>[1], SubjectType>
    : SubjectType;

/**
 * Create a `@UseAbility` decorator **bound to your `AppAbility`**, so the
 * `action` and `subject` arguments are type-checked (the bare {@link UseAbility}
 * accepts any string). Define it once and import it instead — the CASL-for-NestJS
 * analogue of `@casl/react`'s `createContextualCan`:
 *
 * ```ts
 * // casl.ts
 * export const UseAbility = createUseAbility<AppAbility>();
 *
 * // @UseAbility('create', 'Article')   ✓
 * // @UseAbility('frobnicate', 'Ghost') ✗ compile error
 * ```
 */
export function createUseAbility<TAbility extends AnyAbility>() {
  return (
    action: ActionOf<TAbility>,
    subject: SubjectOf<TAbility>,
    subjectHook?: SubjectBeforeFilterTuple,
  ) => UseAbility(action as string, subject as SubjectType, subjectHook);
}
