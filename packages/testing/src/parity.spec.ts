import { subject } from '@casl/ability';
import type { RolePermissions } from '@jperezmart/nest-casl';
import { AbilityFactory } from '@jperezmart/nest-casl';

import { buildAbilityForTest } from './index.js';

/**
 * Issue #9 (issues.json) — `buildAbilityForTest` re-implements the same
 * resolution logic as `AbilityFactory.createForUser` (superuser short-circuit,
 * `true` → `manage all`, function → definition). This parity suite is the guard
 * against silent divergence: if either implementation changes its semantics,
 * one of these assertions breaks, forcing the change into both (or into a shared
 * helper).
 */

interface User {
  id: string;
  roles: string[];
}

const permissions: RolePermissions<string, User> = {
  everyone(user, { can }) {
    can('read', 'Profile', { ownerId: user.id });
    can('read', 'Comment');
  },
  // Laid down after `everyone`, so its `cannot` wins.
  muted(_user, { cannot }) {
    cannot('read', 'Comment');
  },
  author(user, { can }) {
    can('read', 'Article', { published: true });
    can('update', 'Article', { authorId: user.id });
  },
  // `true` shorthand must mean "manage all" in both implementations.
  moderator: true,
};

/** Build the same ability through both code paths. */
function bothAbilities(
  user: User,
  superuserRole?: string,
): [
  ReturnType<typeof buildAbilityForTest>,
  ReturnType<typeof buildAbilityForTest>,
] {
  const factory = new AbilityFactory(superuserRole ? { superuserRole } : {});
  factory.registerPermissions(permissions);

  const fromFactory = factory.createForUser<User>(user);
  const fromTest = buildAbilityForTest(
    permissions,
    user,
    superuserRole ? { superuserRole } : {},
  );
  return [fromFactory, fromTest];
}

/** Assert both abilities agree on every probe. */
function expectParity(
  user: User,
  probes: Array<
    [string, Parameters<ReturnType<typeof buildAbilityForTest>['can']>[1]]
  >,
  superuserRole?: string,
): void {
  const [a, b] = bothAbilities(user, superuserRole);
  for (const [action, subj] of probes) {
    expect(
      a.can(action, subj),
      `factory.can(${action}) should match buildAbilityForTest`,
    ).toBe(b.can(action, subj));
  }
}

describe('AbilityFactory ↔ buildAbilityForTest parity (#9)', () => {
  it('agrees on a role with conditional rules', () => {
    expectParity({ id: '1', roles: ['author'] }, [
      ['read', subject('Article', { published: true })],
      ['read', subject('Article', { published: false })],
      ['update', subject('Article', { authorId: '1' })],
      ['update', subject('Article', { authorId: '2' })],
      ['delete', subject('Article', { authorId: '1' })],
    ]);
  });

  it('agrees on the `true` (manage all) shorthand', () => {
    expectParity({ id: '2', roles: ['moderator'] }, [
      ['read', 'Article'],
      ['delete', 'Anything'],
      ['manage', 'all'],
    ]);
  });

  it('agrees on the superuser short-circuit', () => {
    expectParity(
      { id: '3', roles: ['admin'] },
      [
        ['delete', 'Anything'],
        ['manage', 'all'],
      ],
      'admin',
    );
  });

  it('agrees on a role without registered permissions', () => {
    expectParity({ id: '4', roles: ['ghost'] }, [
      ['read', 'Article'],
      ['manage', 'all'],
    ]);
  });

  it('agrees on the Everyone permissions, for any user', () => {
    const probes: Array<
      [string, Parameters<ReturnType<typeof buildAbilityForTest>['can']>[1]]
    > = [
      ['read', subject('Profile', { ownerId: '6' })],
      ['read', subject('Profile', { ownerId: '7' })],
      ['read', 'Comment'],
      ['update', subject('Article', { authorId: '6' })],
    ];
    expectParity({ id: '6', roles: ['author'] }, probes);
    expectParity({ id: '6', roles: ['ghost'] }, probes);
    expectParity({ id: '6', roles: [] }, probes);
    expectParity({ id: '6' } as unknown as User, probes);
  });

  it("agrees that a Role's `cannot` overrides the Everyone permissions", () => {
    expectParity({ id: '8', roles: ['muted'] }, [['read', 'Comment']]);
    expect(
      bothAbilities({ id: '8', roles: ['muted'] })[1].can('read', 'Comment'),
    ).toBe(false);
  });

  it('agrees on a foreign Role named `everyone`: the rules once, nothing more', () => {
    for (const roles of [['everyone'], ['muted', 'everyone']]) {
      const [fromFactory, fromTest] = bothAbilities({ id: '9', roles });
      const [bare] = bothAbilities({
        id: '9',
        roles: roles.filter(r => r !== 'everyone'),
      });
      expect(fromFactory.rules).toEqual(bare.rules);
      expect(fromTest.rules).toEqual(bare.rules);
    }
  });

  it('agrees that the superuser skips the Everyone permissions', () => {
    const [fromFactory, fromTest] = bothAbilities(
      { id: '10', roles: ['admin'] },
      'admin',
    );
    expect(fromTest.rules).toEqual(fromFactory.rules);
    expect(fromFactory.rules).toEqual([{ action: 'manage', subject: 'all' }]);
  });

  it('agrees on a malformed (missing) `roles` field — neither throws, both grant nothing (#5)', () => {
    const user = { id: '5' } as unknown as User;
    expectParity(
      user,
      [
        ['read', 'Article'],
        ['manage', 'all'],
      ],
      'admin',
    );
  });
});
