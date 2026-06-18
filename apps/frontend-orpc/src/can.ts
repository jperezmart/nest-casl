import type { CanProps } from '@casl/react';
import { Can as CaslCan } from '@casl/react';
import type { AppAbility } from '@jperezmart/orpc-abilities';
import type { ReactNode } from 'react';

// `@casl/react`'s exported `Can` is generic, but with no `ability` prop to infer
// from it defaults to `AnyAbility` — so `I`/`a`/`this` accept any string. Bind it
// to our `AppAbility` here to get compile-time-checked actions and subjects.
export const Can = CaslCan as (props: CanProps<AppAbility>) => ReactNode;
