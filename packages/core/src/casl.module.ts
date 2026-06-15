import { Module } from "@nestjs/common";
import type { DynamicModule, Provider } from "@nestjs/common";
import type { AnyAbility } from "@casl/ability";

import { CASL_ROOT_OPTIONS } from "./constants.js";
import { AbilityFactory } from "./factories/ability.factory.js";
import { AccessGuard } from "./guards/access.guard.js";
import type {
  CaslFeatureOptions,
  CaslModuleAsyncOptions,
  CaslModuleOptions,
} from "./interfaces/casl-options.interface.js";
import type { AuthorizableUser } from "./interfaces/authorizable-user.interface.js";
import type { AuthorizableRequest } from "./interfaces/authorizable-request.interface.js";
import type { AppAbility, Permissions } from "./types.js";

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
   * Global, synchronous configuration. The `Roles` type parameter pins the
   * role union used across `forFeature` permission maps. Registered globally so
   * the guard, factory and options are injectable everywhere.
   */
  static forRoot<
    Roles extends string = string,
    TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
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
    TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
    TRequest extends AuthorizableRequest<TUser> = AuthorizableRequest<TUser>,
  >(options: CaslModuleAsyncOptions<Roles, TUser, TRequest>): DynamicModule {
    const optionsProvider: Provider = {
      provide: CASL_ROOT_OPTIONS,
      useFactory: options.useFactory as (...args: unknown[]) => unknown,
      inject: (options.inject ?? []) as never[],
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
   * Per-feature permissions and subject hooks. Each registration merges its
   * permissions into the global {@link AbilityFactory} at bootstrap and exposes
   * its subject hooks as providers.
   */
  static forFeature<
    Roles extends string = string,
    TUser extends AuthorizableUser<Roles> = AuthorizableUser<Roles>,
    TAbility extends AnyAbility = AppAbility,
  >(options: CaslFeatureOptions<Roles, TUser, TAbility>): DynamicModule {
    const registrationProvider: Provider = {
      provide: Symbol("CASL_FEATURE_REGISTRATION"),
      useFactory: (factory: AbilityFactory) => {
        factory.registerPermissions(options.permissions as Permissions);
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
