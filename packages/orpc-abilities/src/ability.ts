import type { RawRuleOf } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';
import type { PackRule } from '@casl/ability/extra';
import { unpackRules } from '@casl/ability/extra';

import type { AppAbility } from './subjects.js';
import { detectSubjectType } from './subjects.js';

/** Rules in their packed (wire-friendly) form, as sent by `GET /me/abilities`. */
export type PackedRules = PackRule<RawRuleOf<AppAbility>>[];

/** An ability that grants nothing — handy as the initial client state. */
export function createEmptyAbility(): AppAbility {
  return createMongoAbility<AppAbility>([], { detectSubjectType });
}

/** Rebuild a client-side ability from the packed rules fetched from the server. */
export function buildAbilityFromPackedRules(packed: PackedRules): AppAbility {
  return createMongoAbility<AppAbility>(unpackRules(packed), {
    detectSubjectType,
  });
}
