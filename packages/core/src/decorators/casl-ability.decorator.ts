import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import { getCaslContext } from './extract-context.helper.js';

/**
 * Injects the CASL ability built for the current user, for ad-hoc checks inside
 * a handler (`ability.can('read', resource)`).
 *
 * @example `list(@CaslAbility() ability: AppAbility) {}`
 */
export const CaslAbility = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getCaslContext(ctx)?.ability,
);
