import { describe, expect, it } from "vitest";

import {
  buildInvoiceSyncUpdate,
  buildVendorBillSyncUpdate,
  calculateAccountBalance,
  getSignedAmount,
  summarizeTransactions,
} from "./accounting";

describe("getSignedAmount", () => {
  it("treats client payments and other income as money in", () => {
    expect(getSignedAmount({ type: "client_payment", amount: 100 })).toBe(100);
    expect(getSignedAmount({ type: "other_income", amount: "50" })).toBe(50);
  });

  it("treats vendor payments and expenses as money out", () => {
    expect(getSignedAmount({ type: "vendor_payment", amount: 80 })).toBe(-80);
    expect(getSignedAmount({ type: "expense", amount: "19.99" })).toBe(-19.99);
  });
});

describe("calculateAccountBalance", () => {
  it("adds signed transactions to the starting balance", () => {
    const account = { id: "boa", starting_balance: 1000 };
    const transactions = [
      { bank_account_id: "boa", type: "client_payment" as const, amount: 475.18 },
      { bank_account_id: "boa", type: "expense" as const, amount: 36 },
      { bank_account_id: "other", type: "expense" as const, amount: 999 },
    ];

    expect(calculateAccountBalance(account, transactions)).toBe(1439.18);
  });
});

describe("buildInvoiceSyncUpdate", () => {
  it("marks the invoice paid when ledger payments reach the total", () => {
    expect(
      buildInvoiceSyncUpdate(
        {
          total: 475.18,
          status: "sent",
          paid_amount: 0,
          stripe_payment_status: null,
        },
        [
          { amount: 400, txn_date: "2026-06-09" },
          { amount: 75.18, txn_date: "2026-06-10" },
        ],
      ),
    ).toEqual({ paid_amount: 475.18, paid_date: "2026-06-10", status: "paid" });
  });

  it("keeps the current status for partial payments", () => {
    expect(
      buildInvoiceSyncUpdate(
        {
          total: 475.18,
          status: "sent",
          paid_amount: 0,
          stripe_payment_status: null,
        },
        [{ amount: 100, txn_date: "2026-06-09" }],
      ),
    ).toEqual({ paid_amount: 100, paid_date: "2026-06-09", status: "sent" });
  });

  it("reverts a ledger-paid invoice when its payments are removed", () => {
    expect(
      buildInvoiceSyncUpdate(
        {
          total: 100,
          status: "paid",
          paid_amount: 100,
          stripe_payment_status: null,
        },
        [],
      ),
    ).toEqual({ paid_amount: 0, paid_date: null, status: "sent" });
  });

  it("leaves Stripe-paid invoices untouched when no ledger payments exist", () => {
    expect(
      buildInvoiceSyncUpdate(
        {
          total: 100,
          status: "paid",
          paid_amount: 100,
          stripe_payment_status: "paid",
        },
        [],
      ),
    ).toBeNull();
  });

  it("does nothing for unpaid invoices with no ledger payments", () => {
    expect(
      buildInvoiceSyncUpdate(
        {
          total: 100,
          status: "sent",
          paid_amount: 0,
          stripe_payment_status: null,
        },
        [],
      ),
    ).toBeNull();
  });
});

describe("buildVendorBillSyncUpdate", () => {
  it("marks the bill paid using the latest payment date", () => {
    expect(
      buildVendorBillSyncUpdate([
        { amount: 50, txn_date: "2026-06-09" },
        { amount: 70, txn_date: "2026-06-11" },
      ]),
    ).toEqual({ status: "paid", paid_date: "2026-06-11" });
  });

  it("reverts to received when no payments remain", () => {
    expect(buildVendorBillSyncUpdate([])).toEqual({
      status: "received",
      paid_date: null,
    });
  });
});

describe("summarizeTransactions", () => {
  it("summarizes money in, money out, and expenses for the month", () => {
    const transactions = [
      {
        type: "client_payment" as const,
        amount: 500,
        txn_date: "2026-06-09",
      },
      { type: "vendor_payment" as const, amount: 120, txn_date: "2026-06-10" },
      { type: "expense" as const, amount: 30.5, txn_date: "2026-06-12" },
      { type: "expense" as const, amount: 999, txn_date: "2026-05-30" },
    ];

    expect(summarizeTransactions(transactions, "2026-06")).toEqual({
      moneyIn: 500,
      moneyOut: 150.5,
      expense: 30.5,
      net: 349.5,
    });
  });
});
