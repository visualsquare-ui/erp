import Stripe from "stripe";

import { toNumber } from "./erp-calculations";
import type { InvoiceDocument } from "./invoice-document";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripeClient ??= new Stripe(stripeSecretKey);

  return stripeClient;
}

export function getStripeAmountInCents(invoice: Pick<InvoiceDocument, "total">) {
  return Math.round(toNumber(invoice.total) * 100);
}

export function buildInvoiceCheckoutSessionParams({
  invoice,
  baseUrl,
}: {
  invoice: InvoiceDocument;
  baseUrl: string;
}): Stripe.Checkout.SessionCreateParams {
  const amount = getStripeAmountInCents(invoice);

  if (amount <= 0) {
    throw new Error("Invoice total must be greater than $0.00.");
  }

  const successUrl = new URL(
    `/api/invoices/${invoice.id}/payment-result`,
    baseUrl,
  );
  successUrl.searchParams.set("status", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(
    `/api/invoices/${invoice.id}/payment-result`,
    baseUrl,
  );
  cancelUrl.searchParams.set("status", "cancelled");

  return {
    mode: "payment",
    client_reference_id: invoice.id,
    customer_email: invoice.clients?.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: "Visual Square invoice payment",
          },
        },
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
    },
    payment_intent_data: {
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
      },
    },
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
  };
}

export async function createInvoiceCheckoutSession({
  invoice,
  baseUrl,
}: {
  invoice: InvoiceDocument;
  baseUrl: string;
}) {
  return getStripeClient().checkout.sessions.create(
    buildInvoiceCheckoutSessionParams({ invoice, baseUrl }),
  );
}
