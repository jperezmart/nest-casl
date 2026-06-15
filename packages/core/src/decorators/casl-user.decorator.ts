import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";

import { getCaslContext } from "./extract-context.helper.js";

/**
 * Injects the authenticated user resolved by `getUserFromRequest`.
 *
 * @example `findMine(@CaslUser() user: AppUser) {}`
 */
export const CaslUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getCaslContext(ctx)?.user,
);
