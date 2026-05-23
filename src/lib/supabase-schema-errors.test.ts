import { describe, expect, it } from "vitest";

import { getInvoiceItemSchemaHint } from "./supabase-schema-errors";

describe("supabase schema errors", () => {
  it("returns the migration hint for missing invoice item PO links", () => {
    expect(
      getInvoiceItemSchemaHint(
        "Could not find the 'purchase_order_id' column of 'invoice_items' in the schema cache",
      ),
    ).toContain("202605230003_invoice_po_links.sql");
  });
});
