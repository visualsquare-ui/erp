import { describe, expect, it } from "vitest";

import {
  buildInvoiceItemsFromPurchaseOrder,
  parsePurchaseOrderSpecItems,
} from "./invoice-po-items";

describe("parsePurchaseOrderSpecItems", () => {
  it("parses structured PO items for invoice import", () => {
    const items = parsePurchaseOrderSpecItems(
      JSON.stringify({
        items: [
          {
            jobId: "job-1",
            item: "Window Sticker Printing",
            unitPrice: 28.5,
            qty: 2,
          },
        ],
      }),
    );

    expect(items).toEqual([
      {
        jobId: "job-1",
        item: "Window Sticker Printing",
        unitPrice: 28.5,
        qty: 2,
      },
    ]);
  });
});

describe("buildInvoiceItemsFromPurchaseOrder", () => {
  it("converts each PO line into an invoice item with PO reference", () => {
    const items = buildInvoiceItemsFromPurchaseOrder({
      id: "po-1",
      po_number: "PO-1001",
      spec: JSON.stringify({
        items: [
          { jobId: "job-1", item: "Decal", unitPrice: 7, qty: 2 },
          { jobId: "job-2", item: "Banner", unitPrice: 300, qty: 1 },
        ],
      }),
      amount: 314,
    });

    expect(items).toEqual([
      {
        purchaseOrderId: "po-1",
        jobId: "job-1",
        description: "PO-1001 · Decal",
        quantity: 2,
        unitPrice: 7,
      },
      {
        purchaseOrderId: "po-1",
        jobId: "job-2",
        description: "PO-1001 · Banner",
        quantity: 1,
        unitPrice: 300,
      },
    ]);
  });
});
