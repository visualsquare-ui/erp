import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  buildEstimateEmailHtml,
  buildEstimateEmailSubject,
  buildEstimateEmailText,
  getEstimateRecipient,
} from "@/lib/estimate-document";
import { buildEstimatePdf } from "@/lib/estimate-pdf";
import { getEstimateDocument } from "@/lib/estimate-server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const estimate = await getEstimateDocument(id);

  if (!estimate) {
    return NextResponse.json(
      { error: "Estimate를 찾을 수 없거나 로그인이 필요합니다." },
      { status: 404 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY와 RESEND_FROM_EMAIL을 설정해야 발송할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  const recipient = getEstimateRecipient(estimate);

  if (!recipient.email) {
    return NextResponse.json(
      { error: "고객 이메일이 없어 견적서를 발송할 수 없습니다." },
      { status: 400 },
    );
  }

  const pdf = await buildEstimatePdf(estimate);
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
      subject: buildEstimateEmailSubject(estimate),
      html: buildEstimateEmailHtml(estimate),
      text: buildEstimateEmailText(estimate),
      attachments: [
        {
          filename: `${estimate.estimate_number}.pdf`,
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

  // Only a draft moves to "sent". Accepted or declined estimates keep their status
  // when they are re-sent.
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("estimates")
    .update({
      sent_at: new Date().toISOString(),
      ...(estimate.status === "draft" ? { status: "sent" } : {}),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      {
        error: `이메일은 발송됐지만 상태를 '발송'으로 바꾸지 못했습니다: ${updateError.message}`,
      },
      { status: 500 },
    );
  }

  revalidatePath("/estimates");

  return NextResponse.json({
    ok: true,
    resendId: body.id ?? null,
    sentTo: recipient.email,
  });
}
