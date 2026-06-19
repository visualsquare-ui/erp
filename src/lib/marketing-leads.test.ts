import { describe, expect, it } from "vitest";

import {
  buildLeadConversionDraft,
  findExistingClientForLead,
  summarizeRecentLeads,
} from "./marketing-leads";

const now = new Date("2026-06-15T12:00:00-04:00");

describe("marketing leads", () => {
  it("summarizes recent lead status counts inside the 30 day window", () => {
    const summary = summarizeRecentLeads(
      [
        { created_at: "2026-06-15T10:00:00-04:00", status: "new" },
        { created_at: "2026-06-14T10:00:00-04:00", status: "contacted" },
        { created_at: "2026-06-10T10:00:00-04:00", status: "quoted" },
        { created_at: "2026-06-01T10:00:00-04:00", status: "won" },
        { created_at: "2026-06-01T10:00:00-04:00", status: "spam" },
        { created_at: "2026-05-01T10:00:00-04:00", status: "new" },
      ],
      now,
    );

    expect(summary).toEqual({
      total: 5,
      new: 1,
      contacted: 1,
      quoted: 1,
      won: 1,
      lost: 0,
      spam: 1,
    });
  });

  it("matches an existing client by normalized email before phone", () => {
    const client = findExistingClientForLead(
      [
        {
          id: "client-1",
          email: "owner@example.com",
          phone: "(201) 555-1111",
        },
        {
          id: "client-2",
          email: "other@example.com",
          phone: "(201) 555-0199",
        },
      ],
      {
        email: "OWNER@example.com ",
        phone: "(201) 555-0199",
      },
    );

    expect(client?.id).toBe("client-1");
  });

  it("builds client and job inserts from a lead conversion", () => {
    const draft = buildLeadConversionDraft({
      lead: {
        id: "lead-1",
        name: "Jane Owner",
        company_name: "Jane Studio",
        email: "jane@example.com",
        phone: "(201) 555-0199",
        service: "branding",
        message: "Need storefront signage and cards.",
      },
      clientId: "client-1",
      today: "2026-06-15",
    });

    expect(draft.clientInsert).toEqual({
      address: null,
      company_name: "Jane Studio",
      email: "jane@example.com",
      memo: "Created from website lead lead-1.",
      name: "Jane Owner",
      phone: "(201) 555-0199",
    });
    expect(draft.jobInsert).toEqual({
      client_id: "client-1",
      description: "Need storefront signage and cards.",
      due_date: null,
      name: "Branding lead - Jane Studio",
      project_id: null,
      quote_amount: 0,
      start_date: "2026-06-15",
      status: "quote",
      type: "branding",
    });
    expect(draft.leadUpdate).toEqual({
      converted_client_id: "client-1",
      status: "quoted",
    });
  });
});
