import type { RawRuleOf } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';
import type { PackRule } from '@casl/ability/extra';
import { unpackRules } from '@casl/ability/extra';

import type { AppAbility } from './subjects.js';
import { detectSubjectType } from './subjects.js';

/** Packed rules as sent over the wire by the backend (`GET /me/abilities`). */
export type PackedRules = PackRule<RawRuleOf<AppAbility>>[];

/** An empty ability — nothing allowed. Used as the initial client state. */
export function createEmptyAbility(): AppAbility {
  return createMongoAbility<AppAbility>([], { detectSubjectType });
}

/**
 * Rebuild the typed ability on the client from the backend's packed rules. The
 * server stays the source of truth for the *rules*; the shared package is the
 * source of truth for the *types* and for how subjects are detected (`kind`).
 */
export function buildAbilityFromPackedRules(packed: PackedRules): AppAbility {
  return createMongoAbility<AppAbility>(unpackRules(packed), {
    detectSubjectType,
  });
}
