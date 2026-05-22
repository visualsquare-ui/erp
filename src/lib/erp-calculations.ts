type InvoiceLineInput = {
  quantity: number;
  unitPrice: number;
  isTaxable: boolean;
  taxRate: number;
};

type ReceivableInput = {
  total: number;
  paidAmount: number;
  status: string;
};

type PayableInput = {
  amount: number;
  status: string;
};

type ProjectMarginInput = {
  invoiceTotal: number;
  vendorBillTotal: number;
  laborCost?: number;
};

export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceDraft(lines: InvoiceLineInput[]) {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
  );
  const tax = roundMoney(
    lines.reduce((sum, line) => {
      if (!line.isTaxable) {
        return sum;
      }

      return sum + line.quantity * line.unitPrice * line.taxRate;
    }, 0),
  );

  return {
    subtotal,
    tax,
    total: roundMoney(subtotal + tax),
  };
}

export function calculateOutstandingAr(invoices: ReceivableInput[]): number {
  return roundMoney(
    invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce(
        (sum, invoice) => sum + Math.max(invoice.total - invoice.paidAmount, 0),
        0,
      ),
  );
}

export function calculateOutstandingAp(bills: PayableInput[]): number {
  return roundMoney(
    bills
      .filter((bill) => bill.status !== "paid")
      .reduce((sum, bill) => sum + bill.amount, 0),
  );
}

export function calculateProjectMargin({
  invoiceTotal,
  vendorBillTotal,
  laborCost = 0,
}: ProjectMarginInput) {
  const margin = roundMoney(invoiceTotal - vendorBillTotal - laborCost);

  return {
    margin,
    marginRate: invoiceTotal > 0 ? roundMoney(margin / invoiceTotal) : 0,
  };
}

export function isExtraRevision(
  version: number,
  includedRevisions: number,
): boolean {
  return version > includedRevisions;
}
