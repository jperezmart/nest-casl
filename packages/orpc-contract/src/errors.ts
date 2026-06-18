/**
 * Errors shared by every procedure. `UNAUTHORIZED` when there is no user;
 * `FORBIDDEN` is thrown by the CASL authorization in the handlers; `NOT_FOUND`
 * when an article id doesn't exist.
 */
export const commonErrors = {
  UNAUTHORIZED: { status: 401, message: 'Authentication required.' },
  FORBIDDEN: {
    status: 403,
    message: 'You are not allowed to perform this action.',
  },
  NOT_FOUND: { status: 404, message: 'Article not found.' },
} as const;
