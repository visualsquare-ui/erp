export type InvoicePaymentLink = {
  key: "stripe" | "zelle" | "venmo";
  label: string;
  method: string;
  href: string;
};

type InvoicePaymentLinkOptions = {
  invoiceId?: string;
  baseUrl?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildStripeInvoicePayHref({
  invoiceId,
  baseUrl,
}: InvoicePaymentLinkOptions) {
  if (!invoiceId) {
    return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
  }

  const path = `/api/invoices/${encodeURIComponent(invoiceId)}/pay`;

  if (!baseUrl) {
    return path;
  }

  return `${trimTrailingSlash(baseUrl)}${path}`;
}

export function getInvoicePaymentLinks(
  options: InvoicePaymentLinkOptions = {},
): InvoicePaymentLink[] {
  return [
    {
      key: "stripe" as const,
      label: "Credit Card",
      method: options.invoiceId ? "Stripe Checkout" : "Stripe",
      href: buildStripeInvoicePayHref(options),
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
