import { describe, expect, it } from "vitest";

import {
  calculateInvoiceDraft,
  calculateOutstandingAp,
  calculateOutstandingAr,
  calculateProjectMargin,
  isExtraRevision,
} from "./erp-calculations";

describe("calculateInvoiceDraft", () => {
  it("calculates subtotal, line-level sales tax, and total", () => {
    expect(
      calculateInvoiceDraft([
        { quantity: 1, unitPrice: 1850, isTaxable: false, taxRate: 0 },
        { quantity: 2, unitPrice: 100, isTaxable: true, taxRate: 0.06625 },
      ]),
    ).toEqual({
      subtotal: 2050,
      tax: 13.25,
      total: 2063.25,
    });
  });
});

describe("ledger calculations", () => {
  it("calculates outstanding AR and AP", () => {
    expect(
      calculateOutstandingAr([
        { total: 500, paidAmount: 100, status: "sent" },
        { total: 300, paidAmount: 300, status: "paid" },
        { total: 200, paidAmount: 0, status: "overdue" },
      ]),
    ).toBe(600);

    expect(
      calculateOutstandingAp([
        { amount: 400, status: "received" },
        { amount: 250, status: "paid" },
      ]),
    ).toBe(400);
  });

  it("calculates project margin and margin rate", () => {
    expect(
      calculateProjectMargin({
        invoiceTotal: 5000,
        vendorBillTotal: 1400,
        laborCost: 600,
      }),
    ).toEqual({
      margin: 3000,
      marginRate: 0.6,
    });
  });
});

describe("isExtraRevision", () => {
  it("flags proof versions beyond included revisions", () => {
    expect(isExtraRevision(4, 3)).toBe(true);
    expect(isExtraRevision(3, 3)).toBe(false);
  });
});
