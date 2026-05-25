import { describe, expect, it } from "vitest";

import { getInvoicePaymentLinks } from "./payment-links";

describe("invoice payment links", () => {
  it("builds an invoice-specific Stripe pay link when an invoice id is provided", () => {
    const links = getInvoicePaymentLinks({
      invoiceId: "invoice-1",
      baseUrl: "https://erp.visualsquare.com",
    });

    expect(links[0]).toMatchObject({
      key: "stripe",
      label: "Credit Card",
      method: "Stripe Checkout",
      href: "https://erp.visualsquare.com/api/invoices/invoice-1/pay",
    });
  });

  it("keeps the static Stripe link as a fallback", () => {
    const previousStripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK = "https://pay.example.com";

    try {
      expect(getInvoicePaymentLinks()[0]).toMatchObject({
        key: "stripe",
        href: "https://pay.example.com",
      });
    } finally {
      process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK = previousStripeLink;
    }
  });
});
