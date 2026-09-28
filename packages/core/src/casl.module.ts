import type { AnyAbility } from '@casl/ability';
import type { DynamicModule, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { CASL_ROOT_OPTIONS } from './constants.js';
import { AbilityFactory } from './factories/ability.factory.js';
import { AccessGuard } from './guards/access.guard.js';
import type { AuthorizableRequest } from './interfaces/authorizable-request.interface.js';
import type { AuthorizableUser } from './interfaces/authorizable-user.interface.js';
import type {
  CaslFeatureOptions,
  CaslModuleAsyncOptions,
  CaslModuleOptions,
} from './interfaces/casl-options.interface.js';
import type { AppAbility } from './types.js';

/**
 * Entry point of the library.
 *
 * - {@link CaslModule.forRoot} — register once at the app root with global
 *   options (superuser role, how to extract the user from the request).
 * - {@link CaslModule.forFeature} — register per feature module with that
 *   feature's permission definitions.
 */
@Module({})
export class CaslModule {
  /**
   * Global, synchronous configuration. Pass the `Roles` type parameter to have
   * `superuserRole` checked against the app's role union. Registered globally
   * so the guard, factory and options are injectable everywhere.
   */
  static forRoot<
    Roles extends string = string,
    TUser extends AuthorizableUser = AuthorizableUser,
    TRequest extends AuthorizableRequest<TUser> = AuthorizableRequest<TUser>,
  >(options: CaslModuleOptions<Roles, TUser, TRequest> = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: CASL_ROOT_OPTIONS,
      useValue: options,
    };
    return {
      module: CaslModule,
      global: true,
      providers: [optionsProvider, AbilityFactory, AccessGuard],
      exports: [optionsProvider, AbilityFactory, AccessGuard],
    };
  }

  /** Global configuration resolved asynchronously from other providers. */
  static forRootAsync<
    Roles extends string = string,
    TUser extends AuthorizableUser = AuthorizableUser,
    TRequest extends AuthorizableRequest<TUser> = AuthorizableRequest<TUser>,
  >(options: CaslModuleAsyncOptions<Roles, TUser, TRequest>): DynamicModule {
    const optionsProvider: Provider = {
      provide: CASL_ROOT_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };
    return {
      module: CaslModule,
      global: true,
      imports: options.imports ?? [],
      providers: [optionsProvider, AbilityFactory, AccessGuard],
      exports: [optionsProvider, AbilityFactory, AccessGuard],
    };
  }

  /**
   * Per-feature permissions. Each registration merges its Role permissions
   * into the global {@link AbilityFactory} at bootstrap. The role union, user
   * and ability types are inferred from `permissions` — no type arguments
   * needed.
   */
  static forFeature<
    Roles extends string = string,
    TUser extends AuthorizableUser = AuthorizableUser,
    TAbility extends AnyAbility = AppAbility,
  >(options: CaslFeatureOptions<Roles, TUser, TAbility>): DynamicModule {
    const registrationProvider: Provider = {
      provide: Symbol('CASL_FEATURE_REGISTRATION'),
      useFactory: (factory: AbilityFactory) => {
        factory.registerPermissions(options.permissions);
        return true;
      },
      inject: [AbilityFactory],
    };
    return {
      module: CaslModule,
      providers: [registrationProvider],
    };
  }
}
