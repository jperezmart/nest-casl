import type {
  AbilityTuple,
  AnyAbility,
  Generics,
  SubjectType,
} from '@casl/ability';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

type AbilitiesOf<T extends AnyAbility> = Generics<T>['abilities'];

/** The action union of an ability (falls back to `string` for loose abilities). */
type ActionOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple ? AbilitiesOf<T>[0] : string;

/** Every subject an ability checks: its types and its instances. */
type SubjectOf<T extends AnyAbility> =
  AbilitiesOf<T> extends AbilityTuple ? AbilitiesOf<T>[1] : unknown;

/** Options for {@link assertCan}. */
export interface AssertCanOptions<TAbility extends AnyAbility = AnyAbility> {
  /**
   * The action that decides whether a denied instance is hidden (404) or
   * merely forbidden (403). Defaults to `'read'`.
   */
  readAction?: ActionOf<TAbility>;
}

/**
 * Throws what the guard throws when `ability` may not perform `action` on
 * `subject`, and returns normally otherwise (ADR 0004):
 *
 * - a subject type (string or class) → `ForbiddenException`;
 * - an instance the user cannot read either → `NotFoundException`, with Nest's
 *   default message, indistinguishable from a genuine not-found;
 * - any other instance → `ForbiddenException`.
 *
 * Pure: no guard, no dependency injection — for services, background jobs and
 * grouped oRPC handlers.
 */
export function assertCan<TAbility extends AnyAbility>(
  ability: TAbility,
  action: ActionOf<TAbility>,
  subject: SubjectOf<TAbility>,
  options: AssertCanOptions<TAbility> = {},
): void {
  const can = ability.can.bind(ability) as (
    action: string,
    subject: unknown,
  ) => boolean;
  if (can(action, subject)) return;

  if (!isSubjectType(subject)) {
    const readAction = options.readAction ?? 'read';
    if (!can(readAction, subject)) throw new NotFoundException();
  }

  throw new ForbiddenException(
    `Insufficient permissions to ${action} ${subjectName(ability, subject)}.`,
  );
}

function isSubjectType(subject: unknown): subject is SubjectType {
  return typeof subject === 'string' || typeof subject === 'function';
}

function subjectName(ability: AnyAbility, subject: unknown): string {
  const type = isSubjectType(subject)
    ? subject
    : (ability.detectSubjectType(subject as never) as SubjectType);
  if (typeof type === 'string') return type;
  return (type as { modelName?: string }).modelName ?? type.name;
}
