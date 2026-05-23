import { createClient } from "@/lib/supabase/server";

import type { InvoiceDocument } from "./invoice-document";

export async function getInvoiceDocument(
  id: string,
): Promise<InvoiceDocument | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "*, clients(company_name, name, email, address), projects(name), invoice_items(*)",
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as InvoiceDocument;
}
