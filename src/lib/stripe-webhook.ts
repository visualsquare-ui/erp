import type Stripe from "stripe";

export type StripeInvoicePaymentUpdate = {
  invoiceId: string;
  paidAmount: number;
  paidDate: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
};

function paymentIntentId(
  paymentIntent: Stripe.Checkout.Session["payment_intent"],
) {
  if (!paymentIntent) {
    return null;
  }

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export function buildInvoicePaymentUpdateFromCheckoutSession(
  session: Stripe.Checkout.Session,
  paidDate: string,
): StripeInvoicePaymentUpdate | null {
  const invoiceId =
    session.metadata?.invoice_id ?? session.client_reference_id ?? null;

  if (!invoiceId || session.payment_status !== "paid") {
    return null;
  }

  return {
    invoiceId,
    paidAmount: (session.amount_total ?? 0) / 100,
    paidDate,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId(session.payment_intent),
    stripePaymentStatus: session.payment_status,
  };
}
