import { describe, expect, it } from "vitest";

import {
  getVendorBillUploadContentType,
  isAllowedVendorBillFile,
} from "./vendor-bill-files";

describe("vendor bill file helpers", () => {
  it("normalizes jpg files to the bucket-allowed image/jpeg content type", () => {
    const file = new File(["jpg"], "bill.jpg", { type: "image/jpg" });

    expect(isAllowedVendorBillFile(file)).toBe(true);
    expect(getVendorBillUploadContentType(file)).toBe("image/jpeg");
  });

  it("allows pdf files and keeps application/pdf", () => {
    const file = new File(["pdf"], "bill.pdf", { type: "application/pdf" });

    expect(isAllowedVendorBillFile(file)).toBe(true);
    expect(getVendorBillUploadContentType(file)).toBe("application/pdf");
  });
});
