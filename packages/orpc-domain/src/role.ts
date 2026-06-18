import { z } from 'zod';

/** Authorization roles used across the example. `admin` is the superuser. */
export const roleSchema = z.enum(['admin', 'author', 'user']);

export type Role = z.infer<typeof roleSchema>;
