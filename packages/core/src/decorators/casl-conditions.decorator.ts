import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";

import { getCaslContext } from "./extract-context.helper.js";

/**
 * Injects a {@link ConditionsProxy} for the rule that matched the guarded
 * `(action, subject)`, so the handler can filter DB queries to the records the
 * user may access.
 *
 * @example `list(@CaslConditions() conditions: ConditionsProxy) {}`
 */
export const CaslConditions = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getCaslContext(ctx)?.conditions,
);
