import { describe, expect, it } from "vitest";
import type Stripe from "stripe";

import { buildInvoicePaymentUpdateFromCheckoutSession } from "./stripe-webhook";

describe("stripe webhook helpers", () => {
  it("builds a paid invoice update from a paid Checkout Session", () => {
    const session = {
      id: "cs_test_123",
      amount_total: 10663,
      client_reference_id: "invoice-1",
      metadata: {
        invoice_id: "invoice-1",
      },
      payment_intent: "pi_123",
      payment_status: "paid",
    } as Stripe.Checkout.Session;

    expect(
      buildInvoicePaymentUpdateFromCheckoutSession(session, "2026-05-24"),
    ).toEqual({
      invoiceId: "invoice-1",
      paidAmount: 106.63,
      paidDate: "2026-05-24",
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_123",
      stripePaymentStatus: "paid",
    });
  });

  it("ignores unpaid Checkout Sessions", () => {
    const session = {
      id: "cs_test_123",
      amount_total: 10663,
      client_reference_id: "invoice-1",
      payment_status: "unpaid",
    } as Stripe.Checkout.Session;

    expect(
      buildInvoicePaymentUpdateFromCheckoutSession(session, "2026-05-24"),
    ).toBeNull();
  });
});
