/**
 * Article subject as a `kind`-tagged plain object (discriminated union). The
 * `kind` field is what CASL uses to resolve the subject type at runtime — see
 * {@link detectSubjectType} — so we never rely on class names.
 */
export interface Article {
  readonly kind: 'Article';
  id: string;
  title: string;
  authorId: string;
  published: boolean;
}

/**
 * Resolves a subject's type from its `kind` discriminator. Wired into
 * `CaslModule.forRoot({ detectSubjectType })`. CASL only invokes it for object
 * subjects — strings are handled before it runs.
 */
export const detectSubjectType = (subject: object): Article['kind'] =>
  (subject as Article).kind;
