import type { AppAbility } from '@jperezmart/example-shared';
import { createUseAbility } from '@jperezmart/nest-casl';

/**
 * `@UseAbility` bound to this app's `AppAbility`, so the `action` and `subject`
 * arguments are type-checked (the bare `UseAbility` accepts any string).
 */
export const UseAbility = createUseAbility<AppAbility>();
