import { createClient } from "@/lib/supabase/server";

import type { EstimateDocument } from "./estimate-document";

export const ESTIMATE_DOCUMENT_SELECT =
  "*, clients(company_name, name, email, address), jobs(name), estimate_items(*)";

export async function getEstimateDocument(
  id: string,
): Promise<EstimateDocument | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("estimates")
    .select(ESTIMATE_DOCUMENT_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EstimateDocument;
}
