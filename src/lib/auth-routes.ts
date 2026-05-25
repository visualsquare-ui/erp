const DEFAULT_REDIRECT = "/dashboard";
const ERP_HOSTS = new Set(["erp.visualsquare.com", "erp-nu-one.vercel.app"]);

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

export function getErpRootRedirectPath(
  pathname: string,
  hostname: string | null,
): string | null {
  if (pathname !== "/" || !isErpHostname(hostname)) {
    return null;
  }

  return DEFAULT_REDIRECT;
}

function isErpHostname(hostname: string | null): boolean {
  const normalizedHostname = hostname?.toLowerCase().split(":")[0] ?? "";

  return (
    ERP_HOSTS.has(normalizedHostname) ||
    /^erp-[a-z0-9-]+-visual-square-s-projects\.vercel\.app$/.test(
      normalizedHostname,
    )
  );
}
