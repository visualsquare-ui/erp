import { LogOut } from "lucide-react";

import { signOut } from "@/app/(erp)/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex h-9 items-center border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--coral)] hover:text-[var(--coral-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
      >
        <LogOut className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
        로그아웃
      </button>
    </form>
  );
}
