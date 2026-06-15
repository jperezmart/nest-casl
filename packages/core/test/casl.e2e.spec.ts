import type { INestApplication } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import type {
  AuthorizableRequest,
  Permissions,
  SubjectBeforeFilterHook,
} from '../src/index.js';
import { CaslModule, CaslSubject, CaslUser, UseAbility } from '../src/index.js';

type Role = 'admin' | 'author' | 'user';

interface User {
  id: string;
  roles: Role[];
}

class Doc {
  constructor(
    public id: string,
    public ownerId: string,
    public published: boolean,
  ) {}
}

@Injectable()
class DocsService {
  private readonly docs = [
    new Doc('1', 'alice', true),
    new Doc('2', 'alice', false),
  ];

  find(id: string): Doc | undefined {
    return this.docs.find(doc => doc.id === id);
  }
}

@Injectable()
class DocHook implements SubjectBeforeFilterHook<Doc> {
  constructor(private readonly docs: DocsService) {}

  run(req: AuthorizableRequest): Doc | undefined {
    const id = req.params?.['id'];
    return id ? this.docs.find(id) : undefined;
  }
}

const permissions: Permissions<Role, User> = {
  user(_user, { can }) {
    can('read', 'Doc', { published: true });
  },
  author(user, { can }) {
    can('read', 'Doc', { published: true });
    can('read', 'Doc', { ownerId: user.id });
    can('create', 'Doc');
    can('update', 'Doc', { ownerId: user.id });
  },
};

@Controller('docs')
class DocsController {
  @Get(':id')
  @UseAbility('read', 'Doc', DocHook)
  read(@CaslSubject() doc: Doc | undefined): Doc {
    if (!doc) throw new NotFoundException();
    return doc;
  }

  @Post()
  @UseAbility('create', 'Doc')
  create(@CaslUser() user: User): { ownerId: string } {
    return { ownerId: user.id };
  }

  @Patch(':id')
  @UseAbility('update', 'Doc', DocHook)
  update(@CaslSubject() doc: Doc | undefined, @Body() _body: unknown): Doc {
    if (!doc) throw new NotFoundException();
    return doc;
  }
}

@Module({
  imports: [CaslModule.forFeature<Role, User>({ permissions })],
  controllers: [DocsController],
  providers: [DocsService, DocHook],
})
class DocsModule {}

function readUser(
  headers: Record<string, string | string[] | undefined>,
): User | undefined {
  const id = headers['x-id'];
  if (typeof id !== 'string') return undefined;
  const roles = headers['x-roles'];
  return {
    id,
    roles: (typeof roles === 'string' ? roles.split(',') : []).filter(
      (role): role is Role => role.length > 0,
    ),
  };
}

describe('CaslModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CaslModule.forRoot<Role>({
          superuserRole: 'admin',
          getUserFromRequest: req =>
            readUser(
              (
                req as {
                  headers: Record<string, string | string[] | undefined>;
                }
              ).headers,
            ),
        }),
        DocsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const as = (id: string, roles: Role) => ({ 'x-id': id, 'x-roles': roles });
  const server = () => app.getHttpServer() as Parameters<typeof request>[0];

  it('401 when there is no authenticated user', () =>
    request(server()).get('/docs/1').expect(401));

  it('a plain user can read a published doc', () =>
    request(server()).get('/docs/1').set(as('carol', 'user')).expect(200));

  it("a plain user cannot read someone else's draft", () =>
    request(server()).get('/docs/2').set(as('carol', 'user')).expect(403));

  it('an author can read their own draft', () =>
    request(server()).get('/docs/2').set(as('alice', 'author')).expect(200));

  it('an author can create', () =>
    request(server()).post('/docs').set(as('alice', 'author')).expect(201));

  it('a plain user cannot create', () =>
    request(server()).post('/docs').set(as('carol', 'user')).expect(403));

  it('a non-owner author cannot update', () =>
    request(server()).patch('/docs/1').set(as('bob', 'author')).expect(403));

  it('the owner can update', () =>
    request(server()).patch('/docs/1').set(as('alice', 'author')).expect(200));

  it('the superuser bypasses every rule', () =>
    request(server()).patch('/docs/1').set(as('root', 'admin')).expect(200));
});
