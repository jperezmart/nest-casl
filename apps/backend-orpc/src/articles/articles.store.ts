import type {
  Article,
  ArticleCreate,
  ArticleUpdate,
} from '@jperezmart/orpc-domain';
import { Injectable } from '@nestjs/common';

/**
 * In-memory article store — same seed and shape as the REST examples. No
 * database; this example is purely Nest + oRPC + CASL + React.
 */
@Injectable()
export class ArticlesStore {
  private sequence = 5;
  private readonly articles: Article[] = [
    { kind: 'Article', id: '1', title: 'Alice — published', authorId: 'alice', published: true }, // prettier-ignore
    { kind: 'Article', id: '2', title: 'Alice — draft', authorId: 'alice', published: false }, // prettier-ignore
    { kind: 'Article', id: '3', title: 'Bob — published', authorId: 'bob', published: true }, // prettier-ignore
    { kind: 'Article', id: '4', title: 'Bob — draft', authorId: 'bob', published: false }, // prettier-ignore
  ];

  findAll(): Article[] {
    return this.articles;
  }

  findById(id: string): Article | undefined {
    return this.articles.find(article => article.id === id);
  }

  create(input: ArticleCreate, authorId: string): Article {
    const article: Article = {
      kind: 'Article',
      id: String(this.sequence++),
      title: input.title,
      authorId,
      published: input.published ?? false,
    };
    this.articles.push(article);
    return article;
  }

  update(id: string, patch: ArticleUpdate): Article | undefined {
    const article = this.findById(id);
    if (!article) return undefined;
    if (patch.title !== undefined) article.title = patch.title;
    if (patch.published !== undefined) article.published = patch.published;
    return article;
  }

  remove(id: string): { deleted: boolean } {
    const index = this.articles.findIndex(article => article.id === id);
    if (index === -1) return { deleted: false };
    this.articles.splice(index, 1);
    return { deleted: true };
  }
}
