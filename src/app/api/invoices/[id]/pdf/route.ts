import { NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/app-url";
import { buildInvoicePdf } from "@/lib/invoice-pdf";
import { getInvoiceDocument } from "@/lib/invoice-server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const invoice = await getInvoiceDocument(id);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice를 찾을 수 없거나 로그인이 필요합니다." },
        { status: 404 },
      );
    }

    const pdf = await buildInvoicePdf(invoice, {
      paymentBaseUrl: getAppBaseUrl(request),
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF 생성에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
