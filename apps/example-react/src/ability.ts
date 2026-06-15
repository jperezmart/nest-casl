import type { MongoAbility } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';

/** The ability type shared with the backend (Mongo-flavoured CASL ability). */
export type AppAbility = MongoAbility;

/** An ability with no rules → nothing allowed. Used as the initial state. */
export const createEmptyAbility = (): AppAbility => createMongoAbility();
