import Image from "next/image";
import Link from "next/link";

import { MarketingLanguageToggle } from "./language-toggle";

export const marketingNavItems = [
  { label: "Services", href: "/#services", ko: "서비스" },
  { label: "Portfolio", href: "/#portfolio", ko: "포트폴리오" },
  { label: "About", href: "/#about", ko: "소개" },
  { label: "Industries", href: "/industries", ko: "업종" },
  { label: "Blog", href: "/blog", ko: "블로그" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const anchorItems = marketingNavItems.slice(0, 3);
  const pageItems = marketingNavItems.slice(3);

  return (
    <div className="marketing-page min-h-screen overflow-x-hidden bg-white text-[var(--foreground)]">
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 px-4 py-5 backdrop-blur sm:px-6 lg:px-12">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Visual Square home"
            className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
          >
            <Image
              src="/logo.png"
              alt="Visual Square"
              width={113}
              height={56}
              className="h-14 w-auto object-contain object-left"
              priority
            />
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm font-bold leading-[1.6] md:flex"
            aria-label="Marketing navigation"
            style={{
              fontFamily:
                "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {anchorItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 text-[var(--foreground)] transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--coral)] after:transition-[width] after:duration-300 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
                data-en={item.label}
                data-ko={item.ko}
              >
                {item.label}
              </Link>
            ))}
            <span aria-hidden="true" className="h-8 w-px bg-[var(--border)]" />
            {pageItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 text-[var(--foreground)] transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--coral)] after:transition-[width] after:duration-300 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
                data-en={item.label}
                data-ko={item.ko}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="border border-black bg-black px-5 py-3 font-bold !text-white transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
              data-en="Get in Touch"
              data-ko="문의하기"
            >
              Get in Touch
            </Link>
            <button
              type="button"
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[var(--border-strong)] bg-transparent text-xs font-bold leading-none tracking-normal text-[var(--muted)] transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
              aria-label="Toggle language"
              data-language-toggle
            >
              KR
            </button>
          </nav>
        </div>
      </header>
      <main className="pt-24">{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--foreground)] text-white">
        <div className="mx-auto grid max-w-[76rem] gap-8 px-4 py-10 text-sm text-white/68 sm:px-6 md:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <Image
              src="/logo-white.png"
              alt="Visual Square"
              width={126}
              height={63}
              className="h-14 w-auto object-contain object-left"
            />
            <p
              className="mt-5 max-w-2xl leading-6"
              data-en={
                "Branding, website design, print design, and production-ready visual assets for businesses in New\u00a0York and New\u00a0Jersey."
              }
              data-ko="뉴욕과 뉴저지 비즈니스를 위한 브랜딩, 웹사이트 디자인, 인쇄 디자인, 제작 준비가 끝난 비주얼 자산을 만듭니다."
            >
              Branding, website design, print design, and production-ready
              visual assets for businesses in New{"\u00a0"}York and{" "}
              New{"\u00a0"}Jersey.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end md:text-right">
            <Link
              href="/blog"
              className="font-semibold text-white underline-offset-4 hover:underline"
              data-en="Read the design insights blog"
              data-ko="디자인 인사이트 블로그 보기"
            >
              Read the design insights blog
            </Link>
            <Link
              href="/#contact"
              className="font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
              data-en="Start a project"
              data-ko="프로젝트 시작하기"
            >
              Start a project
            </Link>
          </div>
        </div>
      </footer>
      <MarketingLanguageToggle />
    </div>
  );
}
