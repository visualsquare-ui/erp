import { describe, expect, it } from "vitest";

import {
  getLoginRedirectPath,
  getPostLoginRedirectPath,
  isPublicAuthPath,
} from "./auth-routes";

describe("isPublicAuthPath", () => {
  it("treats login as public and dashboard as protected", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/")).toBe(false);
  });
});

describe("getLoginRedirectPath", () => {
  it("preserves the requested protected path", () => {
    expect(getLoginRedirectPath("/projects?status=quote")).toBe(
      "/login?next=%2Fprojects%3Fstatus%3Dquote",
    );
  });

  it("falls back to dashboard for unsafe redirect targets", () => {
    expect(getLoginRedirectPath("https://evil.example")).toBe(
      "/login?next=%2F",
    );
  });
});

describe("getPostLoginRedirectPath", () => {
  it("allows same-site paths after login", () => {
    expect(getPostLoginRedirectPath("/clients")).toBe("/clients");
  });

  it("blocks external post-login redirects", () => {
    expect(getPostLoginRedirectPath("https://evil.example")).toBe("/");
  });
});
