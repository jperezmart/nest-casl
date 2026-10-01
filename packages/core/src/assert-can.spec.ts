import { createMongoAbility, subject } from '@casl/ability';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { assertCan } from './assert-can.js';

class Article {
  constructor(
    readonly authorId: string,
    readonly published = true,
  ) {}
}

// An author reads every published article, and their own drafts, but updates
// only their own.
const author = createMongoAbility([
  { action: 'read', subject: 'Article', conditions: { published: true } },
  { action: 'read', subject: 'Article', conditions: { authorId: 'u1' } },
  { action: 'update', subject: 'Article', conditions: { authorId: 'u1' } },
  { action: 'read', subject: Article, conditions: { published: true } },
]);

const own = subject('Article', { authorId: 'u1', published: false });
const othersPublished = subject('Article', { authorId: 'u2', published: true });
const othersDraft = subject('Article', { authorId: 'u2', published: false });

function thrown(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected assertCan to throw');
}

describe('assertCan', () => {
  it('returns when the action is allowed', () => {
    expect(() => assertCan(author, 'update', own)).not.toThrow();
    expect(() => assertCan(author, 'read', 'Article')).not.toThrow();
  });

  it('is 403 for a subject type, never 404', () => {
    expect(thrown(() => assertCan(author, 'delete', 'Article'))).toBeInstanceOf(
      ForbiddenException,
    );
    expect(thrown(() => assertCan(author, 'delete', Article))).toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('is 403 for an instance the user can read', () => {
    expect(
      thrown(() => assertCan(author, 'update', othersPublished)),
    ).toBeInstanceOf(ForbiddenException);
    expect(
      thrown(() => assertCan(author, 'update', new Article('u2'))),
    ).toBeInstanceOf(ForbiddenException);
  });

  it('is 404 for an instance the user cannot read either', () => {
    expect(
      thrown(() => assertCan(author, 'update', othersDraft)),
    ).toBeInstanceOf(NotFoundException);
    expect(
      thrown(() => assertCan(author, 'update', new Article('u2', false))),
    ).toBeInstanceOf(NotFoundException);
  });

  it('gives the 404 the message of a genuine not-found', () => {
    const error = thrown(() => assertCan(author, 'update', othersDraft));

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toEqual(
      new NotFoundException().getResponse(),
    );
    expect((error as Error).message).not.toMatch(/permission/i);
  });

  it('names the action and subject type in the 403', () => {
    expect(
      (thrown(() => assertCan(author, 'update', othersPublished)) as Error)
        .message,
    ).toBe('Insufficient permissions to update Article.');
    expect(
      (thrown(() => assertCan(author, 'delete', Article)) as Error).message,
    ).toBe('Insufficient permissions to delete Article.');
  });

  it('splits 404 from 403 on a custom readAction', () => {
    const viewer = createMongoAbility([
      { action: 'view', subject: 'Article', conditions: { published: true } },
      { action: 'read', subject: 'Article' },
    ]);
    const draft = subject('Article', { authorId: 'u2', published: false });
    const published = subject('Article', { authorId: 'u2', published: true });

    expect(
      thrown(() => assertCan(viewer, 'update', draft, { readAction: 'view' })),
    ).toBeInstanceOf(NotFoundException);
    expect(
      thrown(() =>
        assertCan(viewer, 'update', published, { readAction: 'view' }),
      ),
    ).toBeInstanceOf(ForbiddenException);
    // With the default `'read'`, the same draft is readable, so 403.
    expect(thrown(() => assertCan(viewer, 'update', draft))).toBeInstanceOf(
      ForbiddenException,
    );
  });
});
