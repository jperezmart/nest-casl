import type { AuthorizableUser } from "@jperezmart/nest-casl";

/** Roles used across the example app. */
export type Role = "admin" | "author" | "user";

/** The authenticated user shape for the example. */
export interface AppUser extends AuthorizableUser<Role, string> {
  id: string;
  name: string;
  roles: Role[];
}

/** Sample users the React tester can switch between. */
export const DEMO_USERS: AppUser[] = [
  { id: "admin", name: "Admin", roles: ["admin"] },
  { id: "alice", name: "Alice (author)", roles: ["author"] },
  { id: "bob", name: "Bob (author)", roles: ["author"] },
  { id: "carol", name: "Carol (user)", roles: ["user"] },
];

/**
 * Demo "auth": resolve the user from `x-user-id` / `x-user-roles` headers.
 * A real app would use a JWT/session strategy that populates `request.user`.
 */
export function parseUser(request: {
  headers?: Record<string, unknown>;
}): AppUser | undefined {
  const headers = request.headers ?? {};
  const id = typeof headers["x-user-id"] === "string" ? headers["x-user-id"] : undefined;
  if (!id) return undefined;

  const rawRoles = headers["x-user-roles"];
  const roles = (typeof rawRoles === "string" ? rawRoles.split(",") : [])
    .map((role) => role.trim())
    .filter((role): role is Role => role.length > 0) as Role[];

  const known = DEMO_USERS.find((user) => user.id === id);
  return { id, name: known?.name ?? id, roles: roles.length ? roles : (known?.roles ?? []) };
}
