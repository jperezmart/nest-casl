import type { InferSubjects, MongoAbility } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';

import { assertCan } from '../src/index.js';

interface Article {
  readonly kind: 'Article';
  id: string;
  authorId: string;
}

type Action = 'read' | 'view' | 'update';
type AppAbility = MongoAbility<[Action, InferSubjects<Article> | 'all']>;

const ability = createMongoAbility<AppAbility>();
const article: Article = { kind: 'Article', id: '1', authorId: 'u1' };

describe('assertCan types', () => {
  it('accepts the actions and subjects of a typed Ability', () => {
    expectTypeOf(assertCan(ability, 'update', article)).toEqualTypeOf<void>();
    assertCan(ability, 'read', 'Article');
    assertCan(ability, 'update', article, { readAction: 'view' });
  });

  it('rejects a wrong action', () => {
    // @ts-expect-error — 'frobnicate' is not an Action
    assertCan(ability, 'frobnicate', article);
    // @ts-expect-error — 'peek' is not an Action
    assertCan(ability, 'update', article, { readAction: 'peek' });
  });

  it('rejects a wrong subject', () => {
    // @ts-expect-error — 'Ghost' is not a subject
    assertCan(ability, 'read', 'Ghost');
    // @ts-expect-error — not an Article
    assertCan(ability, 'read', { kind: 'Ghost' });
  });

  it('accepts any action and subject on a loose Ability', () => {
    const loose = createMongoAbility();
    assertCan(loose, 'frobnicate', 'Ghost');
    assertCan(loose, 'frobnicate', { any: 'thing' }, { readAction: 'peek' });
  });
});
