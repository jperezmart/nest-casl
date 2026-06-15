import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { ConditionsProxyImpl } from './conditions.proxy.js';

describe('ConditionsProxyImpl', () => {
  it('exposes the matched rule conditions', () => {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    can('read', 'Article', { published: true });
    const ability = build();

    const conditions = new ConditionsProxyImpl(ability, 'read', 'Article');

    expect(conditions.hasConditions).toBe(true);
    expect(conditions.get()).toEqual({ published: true });
    expect(conditions.toMongo()).toEqual({ published: true });
  });

  it('falls back to an empty object when the rule is unconditional', () => {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    can('manage', 'all');
    const ability = build();

    const conditions = new ConditionsProxyImpl(ability, 'read', 'Article');

    expect(conditions.hasConditions).toBe(false);
    expect(conditions.get()).toBeUndefined();
    expect(conditions.toMongo()).toEqual({});
  });
});
