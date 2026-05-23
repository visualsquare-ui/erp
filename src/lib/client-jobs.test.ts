import { describe, expect, it } from "vitest";

import {
  filterClientsByQuery,
  summarizeRecentClientJobs,
} from "./client-jobs";

describe("filterClientsByQuery", () => {
  const clients = [
    {
      id: "client-1",
      company_name: "Sweet Churros",
      name: "Paul Choi",
      email: "sweet@example.com",
      phone: "(917) 847-1878",
      address: "11 W 32nd Street, New York, NY 10001",
    },
    {
      id: "client-2",
      company_name: "101 Chicken",
      name: "Garam Lee",
      email: "garam@example.com",
      phone: "(201) 402-0001",
      address: "Fort Lee, NJ",
    },
  ];

  it("filters clients across company, contact, email, phone, and address", () => {
    expect(filterClientsByQuery(clients, "sweet")).toHaveLength(1);
    expect(filterClientsByQuery(clients, "garam")[0].id).toBe("client-2");
    expect(filterClientsByQuery(clients, "2014020001")[0].id).toBe("client-2");
    expect(filterClientsByQuery(clients, "new york")[0].id).toBe("client-1");
    expect(filterClientsByQuery(clients, "")).toHaveLength(2);
  });
});

describe("summarizeRecentClientJobs", () => {
  it("returns the latest five jobs with quote, cost, sales, and profit", () => {
    const summaries = summarizeRecentClientJobs({
      clientId: "client-1",
      jobs: [
        {
          id: "job-old",
          client_id: "client-1",
          name: "Old Banner",
          due_date: "2026-04-01",
          created_at: "2026-03-01T00:00:00Z",
          quote_amount: 300,
        },
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `job-${index + 1}`,
          client_id: "client-1",
          name: `Job ${index + 1}`,
          due_date: `2026-05-0${index + 1}`,
          created_at: `2026-05-0${index + 1}T00:00:00Z`,
          quote_amount: 1000 + index,
        })),
        {
          id: "other-client-job",
          client_id: "client-2",
          name: "Other Client Job",
          due_date: "2026-05-09",
          created_at: "2026-05-09T00:00:00Z",
          quote_amount: 500,
        },
      ],
      invoices: [
        {
          invoice_items: [
            { job_id: "job-5", amount: 1200 },
            { job_id: "job-5", amount: 300 },
            { job_id: "job-old", amount: 700 },
          ],
        },
      ],
      purchaseOrders: [
        {
          spec: JSON.stringify({
            items: [
              { jobId: "job-5", unitPrice: 200, qty: 2 },
              { jobId: "job-old", unitPrice: 50, qty: 1 },
            ],
          }),
        },
      ],
    });

    expect(summaries).toHaveLength(5);
    expect(summaries[0]).toMatchObject({
      id: "job-5",
      name: "Job 5",
      quote: 1004,
      cost: 400,
      sales: 1500,
      profit: 1100,
      marginRate: 0.73,
    });
    expect(summaries.map((summary) => summary.id)).not.toContain("job-old");
  });
});
