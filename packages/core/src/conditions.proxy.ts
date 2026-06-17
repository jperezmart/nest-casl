import type { AnyAbility, SubjectType } from '@casl/ability';

import type { ConditionsProxy } from './interfaces/conditions-proxy.interface.js';
import type { AnyObject } from './types.js';

/**
 * Default {@link ConditionsProxy} implementation, backed by the CASL rule that
 * matched the guarded `(action, subject)`.
 *
 * Scope: this exposes the conditions of the single **most relevant** rule, via
 * CASL's `relevantRuleFor` (the same primitive CASL documents for inspecting a
 * decision). It is **not** a full query builder: it does not OR-combine the
 * conditions of several matching `can` rules, nor fold `cannot` rules into
 * exclusions. To turn an ability into a complete database query, use CASL's
 * `accessibleBy` / `rulesToQuery` from `@casl/ability/extra` instead.
 */
export class ConditionsProxyImpl<
  TConditions extends AnyObject = AnyObject,
> implements ConditionsProxy<TConditions> {
  constructor(
    private readonly ability: AnyAbility,
    private readonly action: string,
    private readonly subject: SubjectType,
  ) {}

  get hasConditions(): boolean {
    return this.get() !== undefined;
  }

  get(): TConditions | undefined {
    const rule = this.ability.relevantRuleFor(this.action, this.subject);
    return rule?.conditions as TConditions | undefined;
  }

  toMongo(): TConditions {
    return this.get() ?? ({} as TConditions);
  }
}
