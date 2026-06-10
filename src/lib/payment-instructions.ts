// Visual Square accepts fee-free payment methods only (no Stripe/Square cards).
// The Stripe checkout API route stays dormant in case card payments return.

export type PaymentInstruction = {
  key: "zelle" | "check" | "venmo";
  label: string;
  lines: string[];
};

export const VENMO_HANDLE = "@visualsquare_ny";

export function getPaymentInstructions(): PaymentInstruction[] {
  return [
    {
      key: "zelle",
      label: "Zelle",
      lines: ["visualsquare@gmail.com"],
    },
    {
      key: "check",
      label: "Check",
      lines: [
        'Payable to "Visual Square LLC"',
        "260 Broad Ave #121",
        "Palisades Park, NJ 07650",
      ],
    },
    {
      key: "venmo",
      label: "Venmo",
      lines: [VENMO_HANDLE],
    },
  ];
}

export function buildPaymentMemoNote(invoiceNumber: string): string {
  return `Please include invoice number ${invoiceNumber} in the payment memo.`;
}
