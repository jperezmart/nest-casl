/**
 * Article subject. A named class so CASL's default `detectSubjectType` resolves
 * instances to the `"Article"` subject used in the permission rules.
 */
export class Article {
  id!: string;
  title!: string;
  authorId!: string;
  published!: boolean;

  constructor(partial: Partial<Article>) {
    Object.assign(this, partial);
  }
}
