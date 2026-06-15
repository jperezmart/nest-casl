import type { ExecutionContext } from "@nestjs/common";

import { CASL_REQUEST_CONTEXT } from "../constants.js";
import type { CaslRequestContext } from "../interfaces/casl-request-context.interface.js";

/** Read the CASL context cached on the request by {@link AccessGuard}. */
export function getCaslContext(
  ctx: ExecutionContext,
): CaslRequestContext | undefined {
  const request = ctx.switchToHttp().getRequest<Record<PropertyKey, unknown>>();
  return request[CASL_REQUEST_CONTEXT] as CaslRequestContext | undefined;
}
