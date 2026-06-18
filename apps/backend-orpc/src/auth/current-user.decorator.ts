import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import { parseUser } from './parse-user.js';

/**
 * Resolves the demo user from the request headers. Used where there is no
 * `@UseAbility` guard to populate the user (e.g. the `me` endpoints) — the
 * grouped-form counterpart to nest-casl's `@CaslUser`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    parseUser(ctx.switchToHttp().getRequest()),
);
