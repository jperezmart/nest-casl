import { createUseAbility } from '@jperezmart/nest-casl';

import type { AppAbility } from './articles/article.entity.js';

/**
 * `@UseAbility` bound to this app's `AppAbility`, so the `action` and `subject`
 * arguments are type-checked (the bare `UseAbility` accepts any string).
 */
export const UseAbility = createUseAbility<AppAbility>();
