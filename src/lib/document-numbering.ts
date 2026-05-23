type BillForNumbering = {
  id: string;
  bill_number: string | null;
  vendor_id: string;
  received_date: string;
  created_at: string;
  vendors?: { name: string } | null;
};

type PurchaseOrderForNumbering = {
  id: string;
  po_number: string;
  order_date: string;
  created_at: string;
};

export function getDateNumberToken(dateValue: string) {
  const [year, month, day] = dateValue.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return "00000000";
  }

  return `${month}${day}${year}`;
}

function sequenceToken(sequence: number) {
  return String(Math.max(1, sequence)).padStart(2, "0");
}

export function getVendorCode(vendorName: string | null | undefined) {
  const code = String(vendorName ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4);

  return code.padEnd(4, "X") || "VEND";
}

export function buildGeneratedVendorBillNumber({
  vendorName,
  receivedDate,
  sequence,
}: {
  vendorName: string | null | undefined;
  receivedDate: string;
  sequence: number;
}) {
  return `${getVendorCode(vendorName)}-${getDateNumberToken(receivedDate)}-${sequenceToken(
    sequence,
  )}`;
}

export function isLegacyInternalVendorBillNumber(value: string) {
  return /^\d{6}-\d+$/.test(value.trim());
}

export function buildGeneratedPurchaseOrderNumber({
  orderDate,
  sequence,
}: {
  orderDate: string;
  sequence: number;
}) {
  return `PO-${getDateNumberToken(orderDate)}-${sequenceToken(sequence)}`;
}

export function isGeneratedPurchaseOrderNumber(value: string) {
  return /^PO-\d{8}-\d{2}$/.test(value.trim());
}

export function buildPurchaseOrderDisplayNumbers(
  purchaseOrders: PurchaseOrderForNumbering[],
) {
  const displayNumbers = new Map<string, string>();
  const generatedSequences = new Map<string, number>();
  const sortedOrders = [...purchaseOrders].sort((first, second) => {
    const createdCompare = first.created_at.localeCompare(second.created_at);

    return createdCompare || first.id.localeCompare(second.id);
  });

  sortedOrders.forEach((order) => {
    const key = getDateNumberToken(order.order_date);
    const sequence = (generatedSequences.get(key) ?? 0) + 1;
    generatedSequences.set(key, sequence);
    displayNumbers.set(
      order.id,
      buildGeneratedPurchaseOrderNumber({
        orderDate: order.order_date,
        sequence,
      }),
    );
  });

  return displayNumbers;
}

export function buildVendorBillDisplayNumbers(bills: BillForNumbering[]) {
  const displayNumbers = new Map<string, string>();
  const generatedSequences = new Map<string, number>();
  const sortedBills = [...bills].sort((first, second) => {
    const createdCompare = first.created_at.localeCompare(second.created_at);

    return createdCompare || first.id.localeCompare(second.id);
  });

  sortedBills.forEach((bill) => {
    if (
      bill.bill_number?.trim() &&
      !isLegacyInternalVendorBillNumber(bill.bill_number)
    ) {
      displayNumbers.set(bill.id, bill.bill_number.trim());
      return;
    }

    const vendorName = bill.vendors?.name ?? bill.vendor_id;
    const key = `${getVendorCode(vendorName)}-${getDateNumberToken(
      bill.received_date,
    )}`;
    const sequence = (generatedSequences.get(key) ?? 0) + 1;
    generatedSequences.set(key, sequence);
    displayNumbers.set(
      bill.id,
      buildGeneratedVendorBillNumber({
        vendorName,
        receivedDate: bill.received_date,
        sequence,
      }),
    );
  });

  return displayNumbers;
}
