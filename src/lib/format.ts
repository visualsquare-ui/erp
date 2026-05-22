export type PaymentTerms = "net_30" | "net_15" | "due_on_receipt";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatUsDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

export function addPaymentTermDays(
  isoDate: string,
  terms: PaymentTerms,
): string {
  const daysByTerm: Record<PaymentTerms, number> = {
    net_30: 30,
    net_15: 15,
    due_on_receipt: 0,
  };
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + daysByTerm[terms]);
  return date.toISOString().slice(0, 10);
}
