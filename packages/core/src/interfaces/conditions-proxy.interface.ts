import type { AnyObject } from "../types.js";

/**
 * Wrapper around the CASL rule conditions that matched the current request,
 * injected via `@CaslConditions()`. Use it to filter DB queries so that a user
 * only ever reads/writes records they are actually permitted to.
 *
 * @typeParam TConditions - Shape of the raw conditions object (Mongo-style query).
 */
export interface ConditionsProxy<TConditions extends AnyObject = AnyObject> {
  /** `true` when the matched rule carries conditions to filter by. */
  readonly hasConditions: boolean;

  /** Raw CASL conditions, or `undefined` when the rule is unconditional. */
  get(): TConditions | undefined;

  /** Conditions as a plain object, falling back to `{}` when unconditional. */
  toMongo(): TConditions;
}
