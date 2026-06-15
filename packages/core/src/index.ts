// Module
export { CaslModule } from "./casl.module.js";

// Guard
export { AccessGuard } from "./guards/index.js";

// Factory
export { AbilityFactory } from "./factories/index.js";

// Decorators
export {
  UseAbility,
  CaslUser,
  CaslAbility,
  CaslConditions,
  CaslSubject,
} from "./decorators/index.js";

// Interfaces (type-only)
export type {
  AuthorizableUser,
  AuthorizableRequest,
  ConditionsProxy,
  CaslRequestContext,
  SubjectBeforeFilterHook,
  SubjectBeforeFilterTuple,
  UseAbilityMetadata,
  CaslModuleOptions,
  CaslModuleAsyncOptions,
  CaslFeatureOptions,
} from "./interfaces/index.js";

// Core types
export type {
  AnyObject,
  AppAbility,
  DefinePermissions,
  Permissions,
} from "./types.js";

// Constants & enums
export {
  DefaultActions,
  CASL_ABILITY_METADATA,
  CASL_ROOT_OPTIONS,
  CASL_FEATURE_OPTIONS,
  CASL_REQUEST_CONTEXT,
} from "./constants.js";
