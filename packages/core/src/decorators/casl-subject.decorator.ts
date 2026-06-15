import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";

import { getCaslContext } from "./extract-context.helper.js";

/**
 * Injects the subject instance loaded by the route's subject hook (cached per
 * request). `undefined` when the route declares no hook.
 *
 * @example `update(@CaslSubject() article: Article) {}`
 */
export const CaslSubject = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getCaslContext(ctx)?.subject,
);
