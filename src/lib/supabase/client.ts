import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicKey, getSupabaseUrl } from ".";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublicKey());
}
