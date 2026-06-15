import { subject } from '@casl/ability';
import type { Permissions } from '@jperezmart/nest-casl';

import { buildAbilityForTest } from './index.js';

interface User {
  id: string;
  roles: string[];
}

const permissions: Permissions<string, User> = {
  author(user, { can }) {
    can('read', 'Article', { published: true });
    can('update', 'Article', { authorId: user.id });
  },
};

describe('buildAbilityForTest', () => {
  it('builds an ability from a permissions map', () => {
    const ability = buildAbilityForTest(permissions, {
      id: '1',
      roles: ['author'],
    });

    expect(ability.can('update', subject('Article', { authorId: '1' }))).toBe(
      true,
    );
    expect(ability.can('update', subject('Article', { authorId: '2' }))).toBe(
      false,
    );
  });

  it('honours the superuserRole option', () => {
    const ability = buildAbilityForTest(
      {},
      { id: 'a', roles: ['admin'] },
      { superuserRole: 'admin' },
    );

    expect(ability.can('delete', 'Anything')).toBe(true);
  });
});
