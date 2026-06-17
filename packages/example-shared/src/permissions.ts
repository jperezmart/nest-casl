import type { AbilityBuilder, AnyMongoAbility } from '@casl/ability';

import type { AppUser } from './auth.js';
import type { Role } from './roles.js';

/**
 * A role's permission declaration. Structurally identical to nest-casl's
 * `DefinePermissions`, but expressed with `@casl/ability` only so this package
 * stays framework-agnostic. `forFeature({ permissions })` accepts it by
 * structural compatibility.
 */
type DefinePermissions = (
  user: AppUser,
  builder: AbilityBuilder<AnyMongoAbility>,
) => void;

/**
 * Article permissions per role — the single source of truth imported by
 * `backend-shared` via `CaslModule.forFeature({ permissions })`. `admin` is
 * intentionally absent: it is the configured `superuserRole` and bypasses these
 * rules entirely.
 *
 * This is the whole point of the shared package: the exact same object can be
 * defined inline (see `backend-simple`) or imported from here — same API, the
 * `permissions` argument just comes from a different place.
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
