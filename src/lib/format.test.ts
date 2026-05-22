import { describe, expect, it } from "vitest";

import { addPaymentTermDays, formatCurrency, formatUsDate } from "./format";

describe("formatCurrency", () => {
  it("formats numeric values as USD with commas and two decimals", () => {
    expect(formatCurrency(12500)).toBe("$12,500.00");
    expect(formatCurrency(-250.5)).toBe("-$250.50");
  });
});

describe("formatUsDate", () => {
  it("formats ISO dates as MM/DD/YYYY", () => {
    expect(formatUsDate("2026-06-30")).toBe("06/30/2026");
  });
});

describe("addPaymentTermDays", () => {
  it("calculates due dates for US invoice payment terms", () => {
    expect(addPaymentTermDays("2026-06-01", "net_30")).toBe("2026-07-01");
    expect(addPaymentTermDays("2026-06-01", "net_15")).toBe("2026-06-16");
    expect(addPaymentTermDays("2026-06-01", "due_on_receipt")).toBe("2026-06-01");
  });
});
