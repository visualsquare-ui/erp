import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_ID = "vercel-cron";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const checkedAt = new Date().toISOString();
  const supabase = createServiceClient();
  const { error } = await supabase.from("system_heartbeats").upsert(
    {
      id: HEARTBEAT_ID,
      checked_at: checkedAt,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Supabase heartbeat failed", {
      code: error.code,
      message: error.message,
    });

    return NextResponse.json(
      { error: "Supabase heartbeat failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, checkedAt });
}
