import { describe, expect, it } from "vitest";

import { getInvoiceClientOptions } from "./invoice-client-options";

describe("invoice client options", () => {
  it("uses every client, including clients without projects", () => {
    const options = getInvoiceClientOptions([
      {
        id: "client-1",
        name: "Garam Lee",
        company_name: "101 Chicken",
      },
      {
        id: "client-2",
        name: "Jane Kim",
        company_name: null,
      },
      {
        id: "client-3",
        name: "Melodia Contact",
        company_name: "Melodia Music",
      },
    ]);

    expect(options).toEqual([
      { id: "client-1", label: "101 Chicken" },
      { id: "client-2", label: "Jane Kim" },
      { id: "client-3", label: "Melodia Music" },
    ]);
  });
});
