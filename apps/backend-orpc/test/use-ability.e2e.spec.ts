import type {
  AuthorizableRequest,
  SubjectBeforeFilterHook,
} from '@jperezmart/nest-casl';
import { CaslModule, CaslSubject, UseAbility } from '@jperezmart/nest-casl';
import { detectSubjectType } from '@jperezmart/orpc-abilities';
import { contract } from '@jperezmart/orpc-contract';
import type { Article } from '@jperezmart/orpc-domain';
import type { INestApplication } from '@nestjs/common';
import { Controller, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Implement, implement } from '@orpc/nest';
import request from 'supertest';

/**
 * Proves that the REST `@UseAbility`/`AccessGuard` works with oRPC's
 * PER-PROCEDURE `@Implement(contract.x.proc)` form: each procedure is its own
 * Nest handler, so the guard runs (before the oRPC interceptor), the subject hook
 * loads from `req.params`, and `@CaslSubject` flows into the oRPC handler. (Only
 * the GROUPED form — `@Implement(contract.branch)` returning a map — collapses
 * several procedures under one handler, where per-procedure metadata can't apply.)
 */

const ARTICLES: Record<string, Article> = {
  '1': { kind: 'Article', id: '1', title: 'Alice', authorId: 'alice', published: false }, // prettier-ignore
};

@Injectable()
class ArticleHook implements SubjectBeforeFilterHook<Article> {
  run(req: AuthorizableRequest): Article | undefined {
    const id = req.params?.['id'];
    return id ? ARTICLES[id] : undefined;
  }
}

@Controller()
class ProbeController {
  // Per-procedure @Implement → its own Nest handler → @UseAbility's guard runs,
  // the hook loads the Article, and @CaslSubject flows into the oRPC handler.
  @Implement(contract.articles.get)
  @UseAbility('read', 'Article', ArticleHook)
  get(@CaslSubject() article: Article | undefined) {
    return implement(contract.articles.get).handler(() => article as Article);
  }
}

interface User {
  id: string;
  roles: string[];
}

@Module({
  imports: [
    CaslModule.forRoot({
      getUserFromRequest: (req: { headers?: Record<string, unknown> }) => {
        const id = req.headers?.['x-user-id'];
        return typeof id === 'string'
          ? ({ id, roles: ['author'] } satisfies User)
          : undefined;
      },
      detectSubjectType,
    }),
    CaslModule.forFeature<string, User>({
      permissions: {
        author: (user, { can }) =>
          can('read', 'Article', { authorId: user.id }),
      },
    }),
  ],
  controllers: [ProbeController],
  providers: [ArticleHook],
})
class ProbeModule {}

describe('@UseAbility with oRPC per-procedure @Implement', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProbeModule],
    }).compile();
    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer() as Parameters<typeof request>[0];

  it('allows the owner (guard + hook + condition over oRPC)', () =>
    request(server())
      .get('/api/articles/1')
      .set({ 'x-user-id': 'alice' })
      .expect(200));

  it('forbids a non-owner', () =>
    request(server())
      .get('/api/articles/1')
      .set({ 'x-user-id': 'bob' })
      .expect(403));

  it('401 without a user', () =>
    request(server()).get('/api/articles/1').expect(401));
});
