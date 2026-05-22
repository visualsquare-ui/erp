import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  ReceiptText,
  UsersRound,
} from "lucide-react";

import { SignOutButton } from "@/components/sign-out-button";

import logo from "../../assets/vs-logo-transparent.png";

const navItems = [
  { label: "대시보드", href: "/", icon: LayoutDashboard },
  { label: "고객", href: "/clients", icon: UsersRound },
  { label: "프로젝트", href: "/projects", icon: BriefcaseBusiness },
  { label: "인보이스", href: "/invoices", icon: FileText },
  { label: "발주·빌", href: "/purchasing", icon: ReceiptText },
  { label: "포트폴리오", href: "/portfolio", icon: GalleryHorizontalEnd },
];

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
  activePath: string;
};

export function AppShell({ children, userEmail, activePath }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-[17rem] border-r border-[var(--border)] bg-white lg:flex lg:flex-col">
        <div className="flex h-24 items-center border-b border-[var(--border)] px-5">
          <Image
            src={logo}
            alt="Visual Square"
            className="h-20 w-44 object-cover object-center"
            priority
          />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? activePath === "/"
                : activePath.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 w-full items-center border px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] ${
                  active
                    ? "border-[var(--coral)] bg-[var(--coral-quiet)] text-[var(--coral-strong)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-4 text-xs leading-5 text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Internal ERP</p>
          <p>Supabase 연결 · 실제 데이터</p>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="min-w-0 flex items-center gap-3 lg:hidden">
            <Image
              src={logo}
              alt="Visual Square"
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="font-display truncate text-lg">Visual Square ERP</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Project-centered operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
              <span className="h-2 w-2 bg-[var(--coral)]" />
              <span className="max-w-[15rem] truncate">{userEmail}</span>
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="mx-auto max-w-[86rem] px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
