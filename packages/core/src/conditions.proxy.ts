import type { AnyAbility, SubjectType } from '@casl/ability';

import type { ConditionsProxy } from './interfaces/conditions-proxy.interface.js';
import type { AnyObject } from './types.js';

/**
 * Default {@link ConditionsProxy} implementation, backed by the CASL rule that
 * matched the guarded `(action, subject)`.
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
