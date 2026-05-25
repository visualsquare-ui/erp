import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { buildInvoicePaymentUpdateFromCheckoutSession } from "@/lib/stripe-webhook";
import { getStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function markInvoicePaid(session: Stripe.Checkout.Session) {
  const update = buildInvoicePaymentUpdateFromCheckoutSession(
    session,
    todayIso(),
  );

  if (!update) {
    return;
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_amount: update.paidAmount,
      paid_date: update.paidDate,
      stripe_checkout_session_id: update.stripeCheckoutSessionId,
      stripe_payment_intent_id: update.stripePaymentIntentId,
      stripe_payment_status: update.stripePaymentStatus,
    })
    .eq("id", update.invoiceId);

  if (error) {
    throw new Error(`Invoice payment update failed: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe webhook signature.",
      },
      { status: 400 },
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await markInvoicePaid(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook 처리에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
