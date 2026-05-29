const PROD_BASE = "/tomato-clock";

export function getBasePath(): string {
  return process.env.NODE_ENV === "production" ? PROD_BASE : "";
}

export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBasePath()}${normalized}`;
}

export function getAuthRedirectUrl(path: string): string {
  if (typeof window === "undefined") {
    return appPath(path);
  }
  return `${window.location.origin}${appPath(path)}`;
}
