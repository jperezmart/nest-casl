import type { AnyAbility } from '@casl/ability';
import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import type {
  AuthorizableRequest,
  RolePermissions,
  SubjectBeforeFilterHook,
} from '../src/index.js';
import { CaslAbility, CaslModule, UseAbility } from '../src/index.js';

// Users from a shared identity provider: most of their Roles belong to other
// apps, and one of those apps happens to hand out a Role named `everyone`.
interface TenantUser {
  username: string;
  roles: string[];
}

class Profile {
  constructor(public owner: string) {}
}

@Injectable()
class ProfileHook implements SubjectBeforeFilterHook<Profile> {
  run(req: AuthorizableRequest): Profile | undefined {
    const owner = req.params?.['owner'];
    return owner ? new Profile(owner) : undefined;
  }
}

const articlesPermissions: RolePermissions<'author' | 'banned', TenantUser> = {
  everyone(_user, { can }) {
    can('read', 'Article');
  },
  author(_user, { can }) {
    can('update', 'Article');
  },
  banned(_user, { cannot }) {
    cannot('read', 'Article');
  },
};

// A second feature with its own Everyone permissions, scoped by the user.
const profilesPermissions: RolePermissions<never, TenantUser> = {
  everyone(user, { can }) {
    can('read', 'Profile', { owner: user.username });
  },
};

@Controller()
class ArticlesController {
  @Get('articles')
  @UseAbility('read', 'Article')
  list(): string {
    return 'ok';
  }

  @Get('articles/edit')
  @UseAbility('update', 'Article')
  edit(): string {
    return 'ok';
  }

  @Get('rules')
  @UseAbility('read', 'Article')
  rules(@CaslAbility() ability: AnyAbility): unknown {
    return ability.rules;
  }
}

@Module({
  imports: [CaslModule.forFeature({ permissions: articlesPermissions })],
  controllers: [ArticlesController],
})
class ArticlesModule {}

@Controller()
class ProfilesController {
  @Get('profiles/:owner')
  @UseAbility('read', 'Profile', ProfileHook)
  read(): string {
    return 'ok';
  }
}

@Module({
  imports: [CaslModule.forFeature({ permissions: profilesPermissions })],
  controllers: [ProfilesController],
  providers: [ProfileHook],
})
class ProfilesModule {}

const USERS: Record<string, TenantUser> = {
  ana: { username: 'ana', roles: ['author'] },
  ben: { username: 'ben', roles: ['billing:admin'] },
  cleo: { username: 'cleo', roles: [] },
  // A token without the claim: `roles` is missing at runtime.
  dan: { username: 'dan' } as TenantUser,
  bob: { username: 'bob', roles: ['banned'] },
  eve: { username: 'eve', roles: ['everyone'] },
  // Eve again, holding no Role at all.
  'eve-bare': { username: 'eve', roles: [] },
  // A foreign `everyone` after the Role that restricts: were it treated as a
  // Role, its rules would be laid down again after the `cannot` and win.
  zed: { username: 'zed', roles: ['banned', 'everyone'] },
};

describe('Everyone permissions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CaslModule.forRoot({
          superuserRole: 'admin',
          getUserFromRequest: (req: { headers: Record<string, unknown> }) => {
            const name = req.headers['x-user'];
            return typeof name === 'string' ? USERS[name] : undefined;
          },
        }),
        ArticlesModule,
        ProfilesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer() as Parameters<typeof request>[0];
  const get = (path: string, user?: string) => {
    const req = request(server()).get(path);
    return user === undefined ? req : req.set('x-user', user);
  };

  describe('apply to every authenticated user', () => {
    it.each([
      ['a user with a declared Role', 'ana'],
      ['a user with only foreign Roles', 'ben'],
      ['a user with no Roles', 'cleo'],
      ['a user without `roles`', 'dan'],
    ])('%s', async (_, user) => {
      await get('/articles', user).expect(200);
    });

    it('alongside the Roles the user holds', async () => {
      await get('/articles/edit', 'ana').expect(200);
      await get('/articles/edit', 'ben').expect(403);
    });
  });

  it('never apply to an unauthenticated request', () =>
    get('/articles').expect(401));

  it("are laid down before the Roles, so a Role's `cannot` wins", () =>
    get('/articles', 'bob').expect(403));

  it('merge across features, and receive the user', async () => {
    await get('/profiles/ben', 'ben').expect(200);
    await get('/profiles/ana', 'ben').expect(404);
  });

  describe('a foreign Role named `everyone`', () => {
    it('gets the Everyone permissions exactly once, and nothing more', async () => {
      const { body: everyone } = await get('/rules', 'eve').expect(200);
      const { body: noRoles } = await get('/rules', 'eve-bare').expect(200);
      expect(everyone).toEqual(noRoles);
    });

    it('does not lay them down again after the Roles', () =>
      get('/articles', 'zed').expect(403));
  });
});
