"use server";

import { redirect } from "next/navigation";

import { getPostLoginRedirectPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getPostLoginRedirectPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=missing`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=invalid`);
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
