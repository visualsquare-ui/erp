import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  buildInvoiceEmailHtml,
  buildInvoiceEmailText,
  getInvoiceRecipient,
} from "@/lib/invoice-document";
import { buildInvoicePdf } from "@/lib/invoice-pdf";
import { getInvoiceDocument } from "@/lib/invoice-server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const invoice = await getInvoiceDocument(id);

  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice를 찾을 수 없거나 로그인이 필요합니다." },
      { status: 404 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY와 RESEND_FROM_EMAIL을 .env.local에 설정해야 발송할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  const recipient = getInvoiceRecipient(invoice);

  if (!recipient.email) {
    return NextResponse.json(
      { error: "고객 이메일이 없어 인보이스를 발송할 수 없습니다." },
      { status: 400 },
    );
  }

  const pdf = await buildInvoicePdf(invoice);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipient.email],
      reply_to: process.env.RESEND_REPLY_TO_EMAIL || undefined,
      subject: `Invoice ${invoice.invoice_number} from Visual Square`,
      html: buildInvoiceEmailHtml(invoice),
      text: buildInvoiceEmailText(invoice),
      attachments: [
        {
          filename: `${invoice.invoice_number}.pdf`,
          content: pdf.toString("base64"),
        },
      ],
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    return NextResponse.json(
      { error: body.message ?? body.error ?? "Resend 발송에 실패했습니다." },
      { status: response.status },
    );
  }

  const supabase = await createClient();
  await supabase.from("invoices").update({ status: "sent" }).eq("id", id);

  return NextResponse.json({ ok: true, resendId: body.id ?? null });
}
