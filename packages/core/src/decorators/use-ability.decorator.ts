import type { SubjectType } from '@casl/ability';
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
