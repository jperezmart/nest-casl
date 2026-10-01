import type { INestApplication } from '@nestjs/common';
import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import type {
  AuthorizableRequest,
  RolePermissions,
  SubjectBeforeFilterHook,
} from '../src/index.js';
import { CaslModule, CaslSubject, UseAbility } from '../src/index.js';

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
  private readonly docs = [new Doc('1', 'alice', false)];

  find(id: string): Doc | undefined {
    return this.docs.find(doc => doc.id === id);
  }
}

/** Hook that loads the doc by `:id`; returns undefined when it doesn't exist. */
@Injectable()
class DocHook implements SubjectBeforeFilterHook<Doc> {
  constructor(private readonly docs: DocsService) {}

  run(req: AuthorizableRequest): Doc | undefined {
    const id = req.params?.['id'];
    return id ? this.docs.find(id) : undefined;
  }
}

const permissions: RolePermissions<Role, User> = {
  // Only a *conditional* read rule — there is no unconditional `read Doc`.
  author(user, { can }) {
    can('read', 'Doc', { ownerId: user.id });
  },
};

@Controller('docs')
class DocsController {
  /** Conditional rule + hook: exercises the fail-open path (issue #1). */
  @Get(':id')
  @UseAbility('read', 'Doc', DocHook)
  read(@CaslSubject() doc: Doc | undefined): Doc {
    if (!doc) throw new NotFoundException();
    return doc;
  }
}

/**
 * Class-level `@UseAbility` — every route inherits the requirement (issue #3).
 * No method-level metadata anywhere in this controller.
 */
@UseAbility('read', 'Secret')
@Controller('secrets')
class SecretsController {
  @Get()
  list(): { ok: true } {
    return { ok: true };
  }
}

const secretPermissions: RolePermissions<Role, User> = {
  admin(_user, { can }) {
    can('read', 'Secret');
  },
};

@Module({
  imports: [
    CaslModule.forFeature<User>({ permissions }),
    CaslModule.forFeature<User>({ permissions: secretPermissions }),
  ],
  controllers: [DocsController, SecretsController],
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

describe('AccessGuard regressions (issues.json)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CaslModule.forRoot<Role>({
          getUserFromRequest: req =>
            readUser(
              (req as { headers: Record<string, string | undefined> }).headers,
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

  describe('#1 — fail-open when the subject hook yields no subject', () => {
    it('denies (404) instead of allowing when a conditional rule cannot be evaluated against a missing subject', () =>
      // Doc 999 does not exist → hook returns undefined. The guard must NOT
      // fall back to `can('read','Doc')` (which is true at the type level for
      // the conditional rule) and silently allow the request.
      request(server())
        .get('/docs/999')
        .set(as('alice', 'author'))
        .expect(404));

    it('still allows when the hook resolves a subject the user owns', () =>
      request(server()).get('/docs/1').set(as('alice', 'author')).expect(200));

    it('hides (404) the doc from a non-owner who cannot read it', () =>
      request(server()).get('/docs/1').set(as('bob', 'author')).expect(404));
  });

  describe('#3 — class-level @UseAbility must protect every route', () => {
    it('denies (403) a user lacking the class-level permission', () =>
      request(server()).get('/secrets').set(as('carol', 'user')).expect(403));

    it('allows a user that satisfies the class-level permission', () =>
      request(server()).get('/secrets').set(as('root', 'admin')).expect(200));

    it('still 401s when there is no user at all', () =>
      request(server()).get('/secrets').expect(401));
  });
});
