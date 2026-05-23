import { describe, expect, it } from "vitest";

import { buildInvoicePdf } from "./invoice-pdf";

const invoice = {
  id: "invoice-1",
  project_id: "project-1",
  client_id: "client-1",
  invoice_number: "VS-2026-0001",
  issue_date: "2026-05-23",
  terms: "net_30" as const,
  due_date: "2026-06-22",
  status: "draft" as const,
  subtotal: 100,
  tax: 6.63,
  total: 106.63,
  paid_amount: 0,
  paid_date: null,
  created_at: "2026-05-23T00:00:00Z",
  clients: {
    company_name: "101 Chicken",
    name: "Garam Lee",
    email: "hello@example.com",
    address: "2151 Lemoine Ave, Fort Lee, NJ 07024",
  },
  projects: {
    name: "Menu Board",
  },
  invoice_items: [
    {
      id: "item-1",
      invoice_id: "invoice-1",
      purchase_order_id: "po-1",
      job_id: "job-1",
      description: "Window decal",
      quantity: 2,
      unit_price: 50,
      amount: 100,
      is_taxable: true,
      tax_rate: 0.06625,
    },
  ],
};

describe("invoice PDF", () => {
  it("builds a PDF buffer", async () => {
    const pdf = await buildInvoicePdf(invoice);

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
