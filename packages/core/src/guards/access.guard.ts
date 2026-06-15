import type { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { ConditionsProxyImpl } from '../conditions.proxy.js';
import {
  CASL_ABILITY_METADATA,
  CASL_REQUEST_CONTEXT,
  CASL_ROOT_OPTIONS,
} from '../constants.js';
import { AbilityFactory } from '../factories/ability.factory.js';
import type { AuthorizableRequest } from '../interfaces/authorizable-request.interface.js';
import type { CaslModuleOptions } from '../interfaces/casl-options.interface.js';
import type { CaslRequestContext } from '../interfaces/casl-request-context.interface.js';
import type {
  SubjectBeforeFilterHook,
  SubjectBeforeFilterTuple,
} from '../interfaces/subject-hook.interface.js';
import type { UseAbilityMetadata } from '../interfaces/use-ability-metadata.interface.js';

/**
 * Guard that enforces `@UseAbility` metadata. Resolves the user, optionally runs
 * the subject hook, builds the ability, checks `ability.can(action, subject)`,
 * and caches the {@link CaslRequestContext} on the request for the parameter
 * decorators. Routes without `@UseAbility` metadata are allowed through.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    private readonly abilityFactory: AbilityFactory,
    @Inject(CASL_ROOT_OPTIONS)
    private readonly options: CaslModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.get<UseAbilityMetadata | undefined>(
      CASL_ABILITY_METADATA,
      context.getHandler(),
    );
    if (!metadata) return true;

    const request = context.switchToHttp().getRequest<AuthorizableRequest>();

    const getUser =
      this.options.getUserFromRequest ??
      ((req: AuthorizableRequest) => req.user);
    const user = getUser(request);
    if (!user) {
      throw new UnauthorizedException(
        'No authenticated user available for the CASL ability check.',
      );
    }

    const ability = this.abilityFactory.createForUser(user);

    let subjectInstance: unknown;
    if (metadata.subjectHook) {
      const hook = this.resolveHook(metadata.subjectHook);
      subjectInstance = await hook.run(request);
    }

    const allowed =
      subjectInstance != null
        ? ability.can(metadata.action, subjectInstance as never)
        : ability.can(metadata.action, metadata.subject as never);

    const caslContext: CaslRequestContext = {
      user,
      ability,
      conditions: new ConditionsProxyImpl(
        ability,
        metadata.action,
        metadata.subject,
      ),
    };
    if (subjectInstance != null) {
      caslContext.subject = subjectInstance as never;
    }
    (request as Record<PropertyKey, unknown>)[CASL_REQUEST_CONTEXT] =
      caslContext;

    if (!allowed) {
      throw new ForbiddenException(
        `Insufficient permissions to ${metadata.action} ${String(metadata.subject)}.`,
      );
    }
    return true;
  }

  private resolveHook(hook: SubjectBeforeFilterTuple): SubjectBeforeFilterHook {
    const type: Type<SubjectBeforeFilterHook> = Array.isArray(hook)
      ? hook[0]
      : hook;
    return this.moduleRef.get(type, { strict: false });
  }
}
