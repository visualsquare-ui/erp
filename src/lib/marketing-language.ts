import type { Language } from "@/content/marketing-content";

export function withLocale(path: string, language: Language) {
  if (language === "en") {
    return path;
  }

  if (path === "/") {
    return "/";
  }

  if (path.startsWith("#")) {
    return `/${path}`;
  }

  return path.startsWith("/ko") ? path : `/ko${path}`;
}

export function alternateLocalePath(path: string, language: Language) {
  if (language === "ko") {
    return path.replace(/^\/ko(?=\/|$)/, "") || "/";
  }

  if (path === "/") {
    return "/";
  }

  return path.startsWith("/ko") ? path : `/ko${path}`;
}
