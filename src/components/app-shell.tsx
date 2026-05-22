import Image from "next/image";
import {
  BarChart3,
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
  { label: "대시보드", icon: LayoutDashboard, active: true },
  { label: "고객", icon: UsersRound, active: false },
  { label: "프로젝트", icon: BriefcaseBusiness, active: false },
  { label: "인보이스", icon: FileText, active: false },
  { label: "발주·빌", icon: ReceiptText, active: false },
  { label: "포트폴리오", icon: GalleryHorizontalEnd, active: false },
  { label: "리포트", icon: BarChart3, active: false },
];

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-[var(--border)] px-5">
          <Image
            src={logo}
            alt="Visual Square"
            className="h-12 w-12 object-contain"
            priority
          />
          <div className="ml-3">
            <p className="font-display text-xl leading-none">Visual Square</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              ERP
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`flex h-10 w-full items-center border px-3 text-left text-sm font-semibold transition ${
                item.active
                  ? "border-[var(--coral)] bg-[var(--coral-quiet)] text-[var(--coral-strong)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-4 text-xs leading-5 text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Phase 0</p>
          <p>로컬 UI 셸 · 샘플 데이터 · Supabase 연결 준비</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Image
              src={logo}
              alt="Visual Square"
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="font-display text-lg">Visual Square ERP</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Project-centered operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
              <span className="h-2 w-2 bg-[var(--coral)]" />
              {userEmail}
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
