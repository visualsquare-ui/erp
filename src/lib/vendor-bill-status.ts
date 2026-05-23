import type { VendorBillRow } from "@/types/database";

type VendorBillStatus = VendorBillRow["status"];

export function isVendorBillPaid(status: VendorBillStatus) {
  return status === "paid";
}

export function getVendorBillStatusLabel(status: VendorBillStatus) {
  return isVendorBillPaid(status) ? "Paid" : "Unpaid";
}

export function getVendorBillStatusTone(status: VendorBillStatus) {
  return isVendorBillPaid(status) ? "success" : "warning";
}
