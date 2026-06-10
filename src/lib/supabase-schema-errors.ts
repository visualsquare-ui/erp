export function getInvoiceItemSchemaHint(message: string) {
  if (
    message.includes("purchase_order_id") &&
    message.includes("invoice_items") &&
    message.includes("schema cache")
  ) {
    return " Supabase SQL Editor에서 supabase/migrations/202605230003_invoice_po_links.sql 을 실행한 뒤, 잠시 후 다시 저장해 주세요.";
  }

  if (
    message.includes("job_id") &&
    message.includes("invoice_items") &&
    message.includes("schema cache")
  ) {
    return " Supabase SQL Editor에서 supabase/migrations/202605230002_jobs_first_schema.sql 을 실행한 뒤, 잠시 후 다시 저장해 주세요.";
  }

  return "";
}

export function getVendorBillSchemaHint(message: string) {
  if (
    message.includes("description") &&
    (message.includes("vendor_bills") || message.includes("schema cache"))
  ) {
    return " Supabase SQL Editor에서 supabase/migrations/202606100001_vendor_bill_description.sql 을 실행한 뒤, 잠시 후 다시 저장해 주세요.";
  }

  return "";
}
