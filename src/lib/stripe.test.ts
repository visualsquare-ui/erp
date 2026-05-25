import { describe, expect, it } from "vitest";

import { buildInvoiceCheckoutSessionParams } from "./stripe";

const invoice = {
  id: "invoice-1",
  project_id: "project-1",
  client_id: "client-1",
  invoice_number: "VS-2026-0001",
  issue_date: "2026-05-23",
  terms: "net_30" as const,
  due_date: "2026-06-22",
  status: "sent" as const,
  subtotal: 100,
  tax: 6.63,
  total: 106.63,
  paid_amount: 0,
  paid_date: null,
  stripe_checkout_session_id: null,
  stripe_checkout_url: null,
  stripe_payment_intent_id: null,
  stripe_payment_status: null,
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
  invoice_items: [],
};

describe("stripe checkout helpers", () => {
  it("builds a one-time Checkout Session for an invoice", () => {
    const params = buildInvoiceCheckoutSessionParams({
      invoice,
      baseUrl: "https://erp.visualsquare.com",
    });

    expect(params).toMatchObject({
      mode: "payment",
      client_reference_id: "invoice-1",
      customer_email: "hello@example.com",
      metadata: {
        invoice_id: "invoice-1",
        invoice_number: "VS-2026-0001",
      },
      success_url:
        "https://erp.visualsquare.com/api/invoices/invoice-1/payment-result?status=success&session_id=%7BCHECKOUT_SESSION_ID%7D",
      cancel_url:
        "https://erp.visualsquare.com/api/invoices/invoice-1/payment-result?status=cancelled",
    });
    expect(params.line_items?.[0]?.price_data?.unit_amount).toBe(10663);
  });
});
