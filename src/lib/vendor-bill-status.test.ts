import { describe, expect, it } from "vitest";

import {
  getVendorBillStatusLabel,
  getVendorBillStatusTone,
  isVendorBillPaid,
} from "./vendor-bill-status";

describe("vendor bill status helpers", () => {
  it("shows received vendor bills as unpaid in the UI", () => {
    expect(getVendorBillStatusLabel("received")).toBe("Unpaid");
    expect(getVendorBillStatusTone("received")).toBe("warning");
    expect(isVendorBillPaid("received")).toBe(false);
  });

  it("shows paid vendor bills as paid in the UI", () => {
    expect(getVendorBillStatusLabel("paid")).toBe("Paid");
    expect(getVendorBillStatusTone("paid")).toBe("success");
    expect(isVendorBillPaid("paid")).toBe(true);
  });
});
