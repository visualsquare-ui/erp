import { describe, expect, it } from "vitest";

import {
  buildGeneratedVendorBillNumber,
  buildVendorBillDisplayNumbers,
  getVendorCode,
} from "./document-numbering";

describe("document numbering", () => {
  it("builds a four character vendor code from the vendor name", () => {
    expect(getVendorCode("BDO Printing")).toBe("BDOP");
    expect(getVendorCode("Printograph.com")).toBe("PRIN");
    expect(getVendorCode("A&J")).toBe("AJXX");
  });

  it("builds generated bill numbers from vendor, bill date, and sequence", () => {
    expect(
      buildGeneratedVendorBillNumber({
        vendorName: "BDO Printing",
        receivedDate: "2026-05-22",
        sequence: 1,
      }),
    ).toBe("BDOP-05222026-01");
  });

  it("displays generated bill numbers instead of ids for bills without numbers", () => {
    const displayNumbers = buildVendorBillDisplayNumbers([
      {
        id: "98a124fb-81c4-4eff-b8ff-9e47d85c8418",
        bill_number: null,
        vendor_id: "vendor-1",
        received_date: "2026-05-23",
        created_at: "2026-05-23T10:00:00Z",
        vendors: { name: "BDO Printing" },
      },
      {
        id: "manual-bill",
        bill_number: "052326-1",
        vendor_id: "vendor-1",
        received_date: "2026-05-23",
        created_at: "2026-05-23T11:00:00Z",
        vendors: { name: "BDO Printing" },
      },
      {
        id: "ba6ddf52-e93b-4041-9454-4e874ad206aa",
        bill_number: null,
        vendor_id: "vendor-1",
        received_date: "2026-05-23",
        created_at: "2026-05-23T12:00:00Z",
        vendors: { name: "BDO Printing" },
      },
    ]);

    expect(displayNumbers.get("98a124fb-81c4-4eff-b8ff-9e47d85c8418")).toBe(
      "BDOP-05232026-01",
    );
    expect(displayNumbers.get("manual-bill")).toBe("052326-1");
    expect(displayNumbers.get("ba6ddf52-e93b-4041-9454-4e874ad206aa")).toBe(
      "BDOP-05232026-02",
    );
  });
});
