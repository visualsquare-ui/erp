import { describe, expect, it } from "vitest";

import { getProjectWorkflow } from "./project-rules";

describe("getProjectWorkflow", () => {
  it("shows purchase and bill workflow for print projects", () => {
    expect(getProjectWorkflow("print").purchaseBills).toBe("required");
  });

  it("hides purchase and bill workflow for web and app projects", () => {
    expect(getProjectWorkflow("web").purchaseBills).toBe("hidden");
    expect(getProjectWorkflow("app").purchaseBills).toBe("hidden");
  });

  it("marks purchase and bill workflow as optional for logo and branding projects", () => {
    expect(getProjectWorkflow("logo").purchaseBills).toBe("optional");
    expect(getProjectWorkflow("branding").purchaseBills).toBe("optional");
  });
});
