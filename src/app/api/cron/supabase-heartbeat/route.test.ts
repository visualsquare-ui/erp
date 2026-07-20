import { beforeEach, describe, expect, it, vi } from "vitest";

import { createServiceClient } from "@/lib/supabase/service";
import { GET } from "./route";

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(),
}));

const mockedCreateServiceClient = vi.mocked(createServiceClient);

function heartbeatRequest(secret?: string) {
  return new Request("https://erp.visualsquare.com/api/cron/supabase-heartbeat", {
    headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
  });
}

describe("Supabase heartbeat cron route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("fails closed when CRON_SECRET is missing", async () => {
    const response = await GET(heartbeatRequest());

    expect(response.status).toBe(500);
    expect(mockedCreateServiceClient).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "expected-secret");

    const response = await GET(heartbeatRequest("wrong-secret"));

    expect(response.status).toBe(401);
    expect(mockedCreateServiceClient).not.toHaveBeenCalled();
  });

  it("upserts the heartbeat for an authorized request", async () => {
    vi.stubEnv("CRON_SECRET", "expected-secret");
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    mockedCreateServiceClient.mockReturnValue({ from } as never);

    const response = await GET(heartbeatRequest("expected-secret"));
    const body = (await response.json()) as { ok: boolean; checkedAt: string };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(new Date(body.checkedAt).toISOString()).toBe(body.checkedAt);
    expect(from).toHaveBeenCalledWith("system_heartbeats");
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "vercel-cron",
        checked_at: body.checkedAt,
      },
      { onConflict: "id" },
    );
  });

  it("reports a database write failure without exposing its details", async () => {
    vi.stubEnv("CRON_SECRET", "expected-secret");
    const upsert = vi.fn().mockResolvedValue({
      error: { code: "42P01", message: "relation does not exist" },
    });
    const from = vi.fn().mockReturnValue({ upsert });
    mockedCreateServiceClient.mockReturnValue({ from } as never);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET(heartbeatRequest("expected-secret"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Supabase heartbeat failed.",
    });
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
