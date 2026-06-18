import type { AnyAbility } from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';

import { CASL_ROOT_OPTIONS } from '../constants.js';
import { AbilityFactory } from '../factories/ability.factory.js';
import type { AuthorizableUser } from '../interfaces/authorizable-user.interface.js';
import type { CaslModuleOptions } from '../interfaces/casl-options.interface.js';
import type { AppAbility } from '../types.js';

/** What {@link OrpcCasl.forRequest} resolves for the current request. */
export interface OrpcCaslContext<TUser, TAbility> {
  user: TUser | undefined;
  ability: TAbility | undefined;
}

/**
 * Helper for authorizing oRPC (`@orpc/nest`) procedures with nest-casl when you
 * use the GROUPED `@Implement(contract.branch)` form — where one Nest handler
 * backs several procedures, so `@UseAbility` (which keys off handler metadata)
 * can't target them individually. Inject this, call {@link forRequest} inside the
 * controller method (it receives the request via `@Req()`), then guard each
 * handler with {@link assertCan} / {@link ensureAbility}.
 *
 * With the PER-PROCEDURE form (`@Implement(contract.branch.proc)` per method),
 * each procedure is its own Nest handler, so the REST `@UseAbility` +
 * `@CaslSubject`/`@CaslUser`/`@CaslAbility` decorators work directly — this
 * helper is just the convenient choice for the grouped form and for
 * collection-level checks.
 *
 * Provide it in the feature module that implements the contract:
 * `providers: [OrpcCasl, ...]`. Requires the optional `@orpc/server` peer.
 */
@Injectable()
export class OrpcCasl {
  constructor(
    @Inject(CASL_ROOT_OPTIONS)
    private readonly options: CaslModuleOptions,
    private readonly factory: AbilityFactory,
  ) {}

  /**
   * Resolve the user (via the `getUserFromRequest` configured in
   * `CaslModule.forRoot`, defaulting to `request.user`) and build their ability.
   * Both are `undefined` when the request is unauthenticated.
   */
  forRequest<
    TUser extends AuthorizableUser = AuthorizableUser,
    TAbility extends AppAbility = AppAbility,
  >(request: unknown): OrpcCaslContext<TUser, TAbility> {
    const getUser =
      this.options.getUserFromRequest ?? ((req: { user?: TUser }) => req.user);
    const user = getUser(request as never) as TUser | undefined;
    const ability = user
      ? this.factory.createForUser<TUser, TAbility>(user)
      : undefined;
    return { user, ability };
  }
}

/**
 * Return the ability, or throw oRPC's `UNAUTHORIZED` when the request had no
 * authenticated user.
 */
export function ensureAbility<TAbility extends AnyAbility>(
  ability: TAbility | undefined,
): TAbility {
  if (!ability) throw new ORPCError('UNAUTHORIZED');
  return ability;
}

/**
 * Authorize a `can(...)` check, throwing oRPC's `UNAUTHORIZED` (no user) or
 * `FORBIDDEN` (user present but not allowed). Always check against the
 * server-loaded record, never client input.
 */
export function assertCan<TAbility extends AnyAbility>(
  ability: TAbility | undefined,
  ...args: Parameters<TAbility['can']>
): void {
  if (!ensureAbility(ability).can(...args)) {
    throw new ORPCError('FORBIDDEN');
  }
}
