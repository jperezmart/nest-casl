import type { CanProps } from '@casl/react';
import { Can as CaslCan } from '@casl/react';
import type { AppAbility } from '@jperezmart/example-shared';
import type { ReactNode } from 'react';

// `@casl/react` v7 removed `createContextualCan` / `createCanBoundTo`. The API is
// now `<AbilityProvider value={ability}>` (see App.tsx) + a generic `Can` that
// reads the ability from context. In JSX that generic can't be inferred, so it
// defaults to `AnyAbility` — bind it to our `AppAbility` by re-typing the
// exported component (same runtime component, narrowed props).
export const Can: (props: CanProps<AppAbility>) => ReactNode = CaslCan;
