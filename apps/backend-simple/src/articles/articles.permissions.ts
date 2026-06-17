import type { Permissions } from '@jperezmart/nest-casl';

import type { AppUser, Role } from '../auth/user.js';

/**
 * Article permissions per role. `admin` is intentionally absent — it is the
 * configured `superuserRole`, so it bypasses these rules entirely.
 */
export const articlesPermissions: Permissions<Role, AppUser> = {
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
