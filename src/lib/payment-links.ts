export type InvoicePaymentLink = {
  key: "stripe" | "zelle" | "venmo";
  label: string;
  method: string;
  href: string;
};

export function getInvoicePaymentLinks(): InvoicePaymentLink[] {
  return [
    {
      key: "stripe" as const,
      label: "Credit Card",
      method: "Stripe",
      href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "",
    },
    {
      key: "zelle" as const,
      label: "Zelle",
      method: "Bank transfer",
      href: process.env.NEXT_PUBLIC_ZELLE_PAYMENT_LINK ?? "",
    },
    {
      key: "venmo" as const,
      label: "Venmo",
      method: "Venmo",
      href: process.env.NEXT_PUBLIC_VENMO_PAYMENT_LINK ?? "",
    },
  ].filter((link) => link.href);
}
