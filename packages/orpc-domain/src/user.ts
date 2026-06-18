import { z } from 'zod';

import { roleSchema } from './role.js';

/** The authenticated user. `roles` drives the CASL abilities. */
export const appUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(roleSchema),
});

export type AppUser = z.infer<typeof appUserSchema>;
