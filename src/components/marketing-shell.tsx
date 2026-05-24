import Image from "next/image";
import Link from "next/link";

import type { Language } from "@/content/marketing-content";
import { alternateLocalePath, withLocale } from "../lib/marketing-language";

import logo from "../../assets/vs-logo-cropped.png";

const labels = {
  en: {
    services: "Services",
    portfolio: "Portfolio",
    about: "About",
    industries: "Industries",
    blog: "Blog",
    cta: "Get in Touch",
    footer:
      "Branding, website design, print design, and production-ready visual assets for businesses in New York and New Jersey.",
    footerLink: "Read the design insights blog",
    switchLabel: "KR",
  },
  ko: {
    services: "서비스",
    portfolio: "포트폴리오",
    about: "소개",
    industries: "업종별",
    blog: "블로그",
    cta: "문의하기",
    footer:
      "뉴욕과 뉴저지 비즈니스를 위한 브랜딩, 웹사이트, 인쇄물, 제작용 디자인 파일을 준비합니다.",
    footerLink: "디자인 인사이트 블로그 보기",
    switchLabel: "EN",
  },
} satisfies Record<Language, Record<string, string>>;

export const marketingNavItems = [
  { label: "Services", href: "/#services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "About", href: "/#about" },
  { label: "Industries", href: "/industries" },
  { label: "Blog", href: "/blog" },
  { label: "Get in Touch", href: "/#contact" },
];

export function MarketingShell({
  children,
  language = "en",
  currentPath = "/industries",
}: {
  children: React.ReactNode;
  language?: Language;
  currentPath?: string;
}) {
  const copy = labels[language];
  const navItems = [
    { label: copy.services, href: "/#services" },
    { label: copy.portfolio, href: "/#portfolio" },
    { label: copy.about, href: "/#about" },
    { label: copy.industries, href: withLocale("/industries", language) },
    { label: copy.blog, href: withLocale("/blog", language) },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-transparent bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
          >
            <Image
              src={logo}
              alt="Visual Square"
              className="h-12 w-[7rem] object-contain object-left sm:h-14 sm:w-[8rem]"
              priority
            />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-bold lg:gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative hidden py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--coral)] after:transition-[width] after:duration-300 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] md:inline-flex"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="hidden whitespace-nowrap border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-3 text-sm font-bold !text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--coral)] hover:bg-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] sm:inline-flex"
            >
              {copy.cta}
            </Link>
            <Link
              href={alternateLocalePath(currentPath, language)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-[0.68rem] font-bold tracking-[0.05em] transition-colors hover:border-[var(--coral)] hover:bg-[var(--coral)] hover:text-white ${
                language === "ko"
                  ? "border-[var(--coral)] bg-[var(--coral)] text-white"
                  : "border-[var(--border-strong)] text-[var(--muted)]"
              }`}
              aria-label={language === "ko" ? "View English page" : "한국어 페이지 보기"}
            >
              {copy.switchLabel}
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--foreground)] text-white">
        <div className="mx-auto grid max-w-[76rem] gap-6 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 md:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <p className="font-semibold text-white">Visual Square</p>
            <p className="mt-2 max-w-2xl leading-6 text-white/68">
              {copy.footer}
            </p>
          </div>
          <div className="md:text-right">
            <Link
              href={withLocale("/blog", language)}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {copy.footerLink}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
