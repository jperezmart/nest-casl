import type { AbilityBuilder, AnyMongoAbility } from '@casl/ability';
import type { AppUser, Role } from '@jperezmart/orpc-domain';

// Typed structurally against @casl/ability so this package stays free of any
// nest-casl dependency — yet the shape is exactly what `CaslModule.forFeature`
// expects.
type DefinePermissions = (
  user: AppUser,
  builder: AbilityBuilder<AnyMongoAbility>,
) => void;

/**
 * Authorization rules per role — identical semantics to the REST examples.
 * `admin` is omitted on purpose: it is wired as the `superuserRole` in
 * `CaslModule.forRoot`, which grants `manage all`.
 */
export const articlesPermissions: Partial<
  Record<Role, boolean | DefinePermissions>
> = {
  // Plain users can only read published articles.
  user(_user, { can }) {
    can('read', 'Article', { published: true });
  },

  // Authors can read published + their own, and manage their own.
  author(user, { can }) {
    can('read', 'Article', { published: true });
    can('read', 'Article', { authorId: user.id });
    can('create', 'Article');
    can('update', 'Article', { authorId: user.id });
    can('delete', 'Article', { authorId: user.id });
  },
};
