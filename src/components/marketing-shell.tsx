import Image from "next/image";
import Link from "next/link";

import logo from "../../assets/vs-logo-cropped.png";

export const marketingNavItems = [
  { label: "Industries", href: "/industries" },
  { label: "Blog", href: "/blog" },
  { label: "Start a Project", href: "/industries#contact" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/industries"
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
          >
            <Image
              src={logo}
              alt="Visual Square"
              className="h-10 w-[5.6rem] object-contain object-left sm:h-11 sm:w-[6.4rem]"
              priority
            />
            <span className="hidden border-l border-[var(--border)] pl-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:inline">
              Brand, web, print
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            {marketingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)] ${
                  item.label === "Start a Project"
                    ? "hidden whitespace-nowrap border-[var(--coral)] bg-[var(--coral)] !text-white hover:border-[var(--coral-strong)] hover:bg-[var(--coral-strong)] sm:inline-flex"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--foreground)] text-white">
        <div className="mx-auto grid max-w-[76rem] gap-6 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 md:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <p className="font-semibold text-white">Visual Square</p>
            <p className="mt-2 max-w-2xl leading-6 text-white/68">
              Branding, website design, print design, and production-ready
              visual assets for businesses in New York and New Jersey.
            </p>
          </div>
          <div className="md:text-right">
            <Link
              href="/blog"
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Read the design insights blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
