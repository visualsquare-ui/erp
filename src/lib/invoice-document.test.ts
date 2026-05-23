import { describe, expect, it } from "vitest";

import {
  buildInvoiceEmailHtml,
  buildInvoiceLineItems,
  getInvoiceRecipient,
} from "./invoice-document";

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

describe("invoice document helpers", () => {
  it("returns recipient details from the invoice client", () => {
    expect(getInvoiceRecipient(invoice)).toEqual({
      name: "101 Chicken",
      email: "hello@example.com",
      address: "2151 Lemoine Ave, Fort Lee, NJ 07024",
    });
  });

  it("builds line item totals for rendering", () => {
    expect(buildInvoiceLineItems(invoice)[0]).toMatchObject({
      description: "Window decal",
      quantity: 2,
      unitPrice: 50,
      amount: 100,
    });
  });

  it("builds a branded minimal email body", () => {
    const html = buildInvoiceEmailHtml(invoice);

    expect(html).toContain("VS-2026-0001");
    expect(html).toContain("101 Chicken");
    expect(html).toContain("$106.63");
    expect(html).toContain("#f57d4b");
  });
});
