import { describe, expect, it } from "vitest";

import {
  buildPaymentMemoNote,
  getPaymentInstructions,
} from "./payment-instructions";

describe("getPaymentInstructions", () => {
  it("lists Zelle, Check, and Venmo with payment details", () => {
    const instructions = getPaymentInstructions();

    expect(instructions.map((instruction) => instruction.key)).toEqual([
      "zelle",
      "check",
      "venmo",
    ]);
    expect(instructions[0].lines).toContain("visualsquare@gmail.com");
    expect(instructions[1].lines.join(" ")).toContain("Visual Square LLC");
    expect(instructions[1].lines.join(" ")).toContain("Palisades Park");
    expect(instructions[2].lines).toContain("@visualsquare_ny");
  });
});

describe("buildPaymentMemoNote", () => {
  it("references the invoice number", () => {
    expect(buildPaymentMemoNote("VS-2026-0002")).toContain("VS-2026-0002");
  });
});
