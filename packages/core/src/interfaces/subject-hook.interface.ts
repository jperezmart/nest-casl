import type { Subject } from '@casl/ability';
import type { Type } from '@nestjs/common';

import type { AuthorizableRequest } from './authorizable-request.interface.js';

/**
 * A subject hook lazily loads the concrete resource (e.g. fetch an Article by
 * its `:id`) **before** permissions are evaluated, so conditional rules like
 * `can('update', Article, { authorId: user.id })` can be checked against the
 * real record. The result is cached on the request for the duration of the call.
 *
 * Implement as an injectable provider so it can use repositories/services.
 *
 * @typeParam TSubject - The resource type returned by the hook.
 * @typeParam TRequest - The incoming request shape.
 */
export interface SubjectBeforeFilterHook<
  TSubject extends Subject = Subject,
  TRequest extends AuthorizableRequest = AuthorizableRequest,
> {
  run(request: TRequest): Promise<TSubject | undefined> | TSubject | undefined;
}

/**
 * Reference to a subject hook accepted by `@UseAbility`. A bare provider class
 * is the common case; the tuple form allows passing static arguments to a
 * hook factory for reusable, parametrised hooks.
 */
export type SubjectBeforeFilterTuple<
  THook extends SubjectBeforeFilterHook = SubjectBeforeFilterHook,
  TArgs = unknown,
> = Type<THook> | [Type<THook>, TArgs];
