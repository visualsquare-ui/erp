import { describe, expect, it } from "vitest";

import {
  getErpRootRedirectPath,
  getLoginRedirectPath,
  getPostLoginRedirectPath,
  isPublicAuthPath,
} from "./auth-routes";

describe("isPublicAuthPath", () => {
  it("treats login and marketing home as public while dashboard is protected", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/")).toBe(true);
    expect(isPublicAuthPath("/dashboard")).toBe(false);
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
      "/login?next=%2Fdashboard",
    );
  });
});

describe("getPostLoginRedirectPath", () => {
  it("allows same-site paths after login", () => {
    expect(getPostLoginRedirectPath("/clients")).toBe("/clients");
  });

  it("blocks external post-login redirects", () => {
    expect(getPostLoginRedirectPath("https://evil.example")).toBe("/dashboard");
  });
});

describe("getErpRootRedirectPath", () => {
  it("sends the ERP domain root to the ERP dashboard", () => {
    expect(getErpRootRedirectPath("/", "erp.visualsquare.com")).toBe(
      "/dashboard",
    );
  });

  it("leaves non-root ERP paths and marketing domains alone", () => {
    expect(getErpRootRedirectPath("/login", "erp.visualsquare.com")).toBeNull();
    expect(getErpRootRedirectPath("/", "visualsquare.com")).toBeNull();
  });
});
