import { describe, expect, it } from "vitest";

import {
  buildEstimateEmailHtml,
  buildEstimateEmailText,
  buildEstimateLineItems,
  buildNextEstimateNumber,
  formatQuantity,
  getDefaultEstimateValidUntil,
  getEstimateRecipient,
  type EstimateDocument,
} from "./estimate-document";
import { buildEstimatePdf } from "./estimate-pdf";

const estimate: EstimateDocument = {
  id: "estimate-1",
  client_id: "client-1",
  job_id: "job-1",
  estimate_number: "EST-2026-0001",
  issue_date: "2026-11-02",
  valid_until: "2026-12-02",
  status: "draft",
  subtotal: 2600,
  tax: 0,
  total: 2600,
  notes: "Installation is not included.",
  sent_at: null,
  created_at: "2026-11-02T00:00:00Z",
  updated_at: "2026-11-02T00:00:00Z",
  clients: {
    company_name: "Players Alliance",
    name: "Tharwa Ibrahim",
    email: "bills@example.org",
    address: null,
  },
  jobs: { name: "Mesh Banners & Step-and-Repeat Banner" },
  estimate_items: [
    {
      id: "item-3",
      estimate_id: "estimate-1",
      position: 2,
      description: "Step-and-Repeat Banner 20' W x 10' H",
      quantity: 1,
      unit_price: 1000,
      amount: 1000,
      is_taxable: false,
      tax_rate: 0.06625,
    },
    {
      id: "item-1",
      estimate_id: "estimate-1",
      position: 0,
      description: 'Mesh Banner 60" H x 180" W (Set 1)\nBooker T. Washington Baseball',
      quantity: "2",
      unit_price: "400",
      amount: "800",
      is_taxable: false,
      tax_rate: 0.06625,
    },
    {
      id: "item-2",
      estimate_id: "estimate-1",
      position: 1,
      description: 'Mesh Banner 60" H x 180" W (Set 2) <Miami>',
      quantity: 2,
      unit_price: 400,
      amount: 800,
      is_taxable: false,
      tax_rate: 0.06625,
    },
  ],
};

describe("estimate document", () => {
  it("orders line items by position and converts numbers", () => {
    const lines = buildEstimateLineItems(estimate);

    expect(lines.map((line) => line.amount)).toEqual([800, 800, 1000]);
    expect(lines[0]).toMatchObject({ quantity: 2, unitPrice: 400 });
  });

  it("uses the company as the recipient and the person as the contact", () => {
    expect(getEstimateRecipient(estimate)).toEqual({
      name: "Players Alliance",
      contact: "Tharwa Ibrahim",
      email: "bills@example.org",
      address: "",
    });
  });

  it("falls back to the contact name when there is no company", () => {
    const recipient = getEstimateRecipient({
      ...estimate,
      clients: { company_name: null, name: "Jane Kim", email: null, address: null },
    });

    expect(recipient.name).toBe("Jane Kim");
    expect(recipient.contact).toBe("");
  });

  it("builds the next number from the highest sequence in the same year", () => {
    expect(buildNextEstimateNumber([], "2026-11-02")).toBe("EST-2026-0001");
    expect(
      buildNextEstimateNumber(
        ["EST-2026-0001", "EST-2026-0007", "EST-2025-0042", "custom"],
        "2026-11-02",
      ),
    ).toBe("EST-2026-0008");
    expect(buildNextEstimateNumber(["EST-2026-0003"], "2027-01-05")).toBe(
      "EST-2027-0001",
    );
  });

  it("defaults validity to 30 days after the issue date", () => {
    expect(getDefaultEstimateValidUntil("2026-11-02")).toBe("2026-12-02");
  });

  it("formats whole and fractional quantities", () => {
    expect(formatQuantity(2)).toBe("2");
    expect(formatQuantity(1.5)).toBe("1.5");
  });

  it("escapes client text in the email html", () => {
    const html = buildEstimateEmailHtml(estimate);

    expect(html).toContain("EST-2026-0001");
    expect(html).toContain("Hi Tharwa Ibrahim,");
    expect(html).toContain("$2,600.00");
    expect(html).toContain("12/02/2026");
    expect(html).toContain("&lt;Miami&gt;");
    expect(html).not.toContain("<Miami>");
  });

  it("writes a plain text email without em dashes or semicolons", () => {
    const text = buildEstimateEmailText(estimate);

    expect(text).toContain("Total: $2,600.00");
    expect(text).not.toMatch(/[—;]/);
  });

  it("renders a pdf", async () => {
    const pdf = await buildEstimatePdf(estimate);

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
