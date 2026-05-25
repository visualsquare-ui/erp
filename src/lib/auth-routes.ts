const DEFAULT_REDIRECT = "/dashboard";

export function isPublicAuthPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/login";
}

export function getLoginRedirectPath(requestedPath: string): string {
  const nextPath = getPostLoginRedirectPath(requestedPath);
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function getPostLoginRedirectPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  return nextPath;
}
