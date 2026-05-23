import { roundMoney, toNumber } from "./erp-calculations";

export type ParsedPurchaseOrderItem = {
  jobId: string | null;
  item: string;
  unitPrice: number;
  qty: number;
};

export type PurchaseOrderForInvoiceImport = {
  id: string;
  po_number: string;
  spec: string | null;
  amount: string | number;
};

export type InvoiceLineDraft = {
  purchaseOrderId: string | null;
  jobId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
};

export function parsePurchaseOrderSpecItems(
  spec: string | null,
): ParsedPurchaseOrderItem[] {
  if (!spec) {
    return [];
  }

  try {
    const parsed = JSON.parse(spec) as {
      items?: {
        jobId?: string | null;
        item?: string;
        unitPrice?: string | number;
        qty?: string | number;
      }[];
    };

    if (!Array.isArray(parsed.items)) {
      return [];
    }

    return parsed.items
      .map((item) => ({
        jobId: item.jobId ?? null,
        item: String(item.item ?? "").trim(),
        unitPrice: toNumber(item.unitPrice),
        qty: toNumber(item.qty) || 1,
      }))
      .filter((item) => item.item && item.unitPrice >= 0 && item.qty > 0);
  } catch {
    return [];
  }
}

export function buildInvoiceItemsFromPurchaseOrder(
  purchaseOrder: PurchaseOrderForInvoiceImport,
): InvoiceLineDraft[] {
  const poItems = parsePurchaseOrderSpecItems(purchaseOrder.spec);

  if (poItems.length === 0) {
    return [
      {
        purchaseOrderId: purchaseOrder.id,
        jobId: null,
        description: purchaseOrder.po_number,
        quantity: 1,
        unitPrice: roundMoney(toNumber(purchaseOrder.amount)),
      },
    ];
  }

  return poItems.map((item) => ({
    purchaseOrderId: purchaseOrder.id,
    jobId: item.jobId,
    description: `${purchaseOrder.po_number} · ${item.item}`,
    quantity: item.qty,
    unitPrice: item.unitPrice,
  }));
}
