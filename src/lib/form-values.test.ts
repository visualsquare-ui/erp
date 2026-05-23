import { describe, expect, it } from "vitest";

import { optionalFormText } from "./form-values";

describe("form values", () => {
  it("returns null for empty optional select values", () => {
    const formData = new FormData();
    formData.set("project_id", "");

    expect(optionalFormText(formData, "project_id")).toBeNull();
  });
});
