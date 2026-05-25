import { NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/app-url";
import { getInvoiceDocumentWithService } from "@/lib/invoice-server";
import { createInvoiceCheckoutSession } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const invoice = await getInvoiceDocumentWithService(id);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (invoice.status === "paid") {
      const paidUrl = new URL(
        `/api/invoices/${id}/payment-result`,
        getAppBaseUrl(request),
      );
      paidUrl.searchParams.set("status", "already_paid");
      return NextResponse.redirect(paidUrl, 303);
    }

    const session = await createInvoiceCheckoutSession({
      invoice,
      baseUrl: getAppBaseUrl(request),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe Checkout URL을 만들 수 없습니다." },
        { status: 500 },
      );
    }

    const supabase = createServiceClient();
    await supabase
      .from("invoices")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_checkout_url: session.url,
        stripe_payment_status: session.payment_status,
      })
      .eq("id", invoice.id);

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "결제 링크 생성에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
