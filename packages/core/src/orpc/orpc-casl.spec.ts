import { subject } from '@casl/ability';
import { ORPCError } from '@orpc/server';

import { AbilityFactory } from '../factories/ability.factory.js';
import { assertCan, ensureAbility, OrpcCasl } from './index.js';

interface User {
  id: string;
  roles: string[];
}

function setup() {
  const options = {
    getUserFromRequest: (req: unknown) => (req as { user?: User }).user,
  };
  const factory = new AbilityFactory(options);
  factory.registerPermissions({
    author: (user, { can }) => {
      can('read', 'Article', { authorId: user.id });
    },
  });
  return new OrpcCasl(options, factory);
}

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return (error as ORPCError<string, unknown>).code;
  }
  return undefined;
};

describe('OrpcCasl', () => {
  it('resolves the user and builds their ability from the request', () => {
    const casl = setup();
    const { user, ability } = casl.forRequest<User>({
      user: { id: 'a', roles: ['author'] },
    });

    expect(user?.id).toBe('a');
    expect(ability?.can('read', subject('Article', { authorId: 'a' }))).toBe(
      true,
    );
    expect(ability?.can('read', subject('Article', { authorId: 'b' }))).toBe(
      false,
    );
  });

  it('returns undefined user and ability when unauthenticated', () => {
    const casl = setup();
    const { user, ability } = casl.forRequest({});

    expect(user).toBeUndefined();
    expect(ability).toBeUndefined();
  });
});

describe('ensureAbility', () => {
  it('throws ORPCError UNAUTHORIZED when there is no ability', () => {
    expect(codeOf(() => ensureAbility(undefined))).toBe('UNAUTHORIZED');
  });

  it('returns the ability when present', () => {
    const ability = setup().forRequest<User>({
      user: { id: 'a', roles: ['author'] },
    }).ability;
    expect(ensureAbility(ability)).toBe(ability);
  });
});

describe('assertCan', () => {
  const ability = setup().forRequest<User>({
    user: { id: 'a', roles: ['author'] },
  }).ability;

  it('passes when allowed', () => {
    expect(() =>
      assertCan(ability, 'read', subject('Article', { authorId: 'a' })),
    ).not.toThrow();
  });

  it('throws FORBIDDEN when the user is present but not allowed', () => {
    expect(
      codeOf(() =>
        assertCan(ability, 'read', subject('Article', { authorId: 'b' })),
      ),
    ).toBe('FORBIDDEN');
  });

  it('throws UNAUTHORIZED when there is no ability', () => {
    expect(codeOf(() => assertCan(undefined, 'read', 'Article'))).toBe(
      'UNAUTHORIZED',
    );
  });
});
