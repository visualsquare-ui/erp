import { NextResponse } from "next/server";

import { buildEstimatePdf } from "@/lib/estimate-pdf";
import { getEstimateDocument } from "@/lib/estimate-server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const estimate = await getEstimateDocument(id);

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate를 찾을 수 없거나 로그인이 필요합니다." },
        { status: 404 },
      );
    }

    const pdf = await buildEstimatePdf(estimate);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${estimate.estimate_number}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "PDF 생성에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
