// Module
export { CaslModule } from './casl.module.js';

// Guard
export { AccessGuard } from './guards/index.js';

// Factory
export { AbilityFactory } from './factories/index.js';

// Decorators
export {
  CaslAbility,
  CaslConditions,
  CaslSubject,
  CaslUser,
  createUseAbility,
  UseAbility,
} from './decorators/index.js';

// Interfaces (type-only)
export type {
  AuthorizableRequest,
  AuthorizableUser,
  CaslFeatureOptions,
  CaslModuleAsyncOptions,
  CaslModuleOptions,
  CaslRequestContext,
  ConditionsProxy,
  SubjectBeforeFilterHook,
  SubjectBeforeFilterTuple,
  UseAbilityMetadata,
} from './interfaces/index.js';

// Core types
export type {
  AnyObject,
  AppAbility,
  DefinePermissions,
  Permissions,
} from './types.js';

// Constants & enums
export {
  CASL_ABILITY_METADATA,
  CASL_FEATURE_OPTIONS,
  CASL_REQUEST_CONTEXT,
  CASL_ROOT_OPTIONS,
  DefaultActions,
} from './constants.js';
