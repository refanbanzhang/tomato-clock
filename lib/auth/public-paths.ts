const PUBLIC_PATHS = new Set([
  "/landing",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
]);

function normalizePath(pathname: string): string {
  const withoutBase = pathname.replace(/^\/tomato-clock/, "") || "/";
  const trimmed = withoutBase.replace(/\/$/, "") || "/";
  return trimmed;
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(normalizePath(pathname));
}
