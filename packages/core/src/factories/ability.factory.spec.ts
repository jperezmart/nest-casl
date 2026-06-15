import { subject } from '@casl/ability';

import { AbilityFactory } from './ability.factory.js';

interface User {
  id: string;
  roles: string[];
}

describe('AbilityFactory', () => {
  it('applies a role permission definition with conditions', () => {
    const factory = new AbilityFactory({});
    factory.registerPermissions({
      author: (user, { can }) => {
        can('read', 'Article', { published: true });
        can('update', 'Article', { authorId: user.id });
      },
    });

    const ability = factory.createForUser<User>({
      id: 'u1',
      roles: ['author'],
    });

    expect(ability.can('update', subject('Article', { authorId: 'u1' }))).toBe(
      true,
    );
    expect(ability.can('update', subject('Article', { authorId: 'u2' }))).toBe(
      false,
    );
    expect(ability.can('read', subject('Article', { published: true }))).toBe(
      true,
    );
  });

  it('grants everything to the superuser role', () => {
    const factory = new AbilityFactory({ superuserRole: 'admin' });

    const ability = factory.createForUser<User>({ id: 'a', roles: ['admin'] });

    expect(ability.can('delete', 'Anything')).toBe(true);
    expect(ability.can('manage', 'all')).toBe(true);
  });

  it('grants nothing for roles without registered permissions', () => {
    const factory = new AbilityFactory({});

    const ability = factory.createForUser<User>({ id: 'g', roles: ['ghost'] });

    expect(ability.can('read', 'Article')).toBe(false);
  });

  it('merges permissions registered across several features', () => {
    const factory = new AbilityFactory({});
    factory.registerPermissions({
      author: (_user, { can }) => {
        can('read', 'Article');
      },
    });
    factory.registerPermissions({
      author: (_user, { can }) => {
        can('create', 'Comment');
      },
    });

    const ability = factory.createForUser<User>({ id: 'u', roles: ['author'] });

    expect(ability.can('read', 'Article')).toBe(true);
    expect(ability.can('create', 'Comment')).toBe(true);
  });

  it('combines the rules of every role the user holds', () => {
    const factory = new AbilityFactory({});
    factory.registerPermissions({
      author: (_user, { can }) => {
        can('create', 'Article');
      },
      moderator: (_user, { can }) => {
        can('delete', 'Comment');
      },
    });

    const ability = factory.createForUser<User>({
      id: 'u',
      roles: ['author', 'moderator'],
    });

    expect(ability.can('create', 'Article')).toBe(true);
    expect(ability.can('delete', 'Comment')).toBe(true);
  });
});
