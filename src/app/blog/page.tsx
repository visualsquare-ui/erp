import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing-shell";
import { EditorialCard, StudioHeroVisual } from "@/components/marketing-visuals";
import {
  blogPosts,
  formatPublishDate,
  getIndustryPage,
  getPublishedBlogPosts,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design Insights Blog | Visual Square",
  description:
    "Branding, website, print, and launch design insights for businesses in New York and New Jersey.",
};

export default function BlogPage() {
  const publishedPosts = getPublishedBlogPosts();
  const nextPosts = blogPosts
    .filter((post) => new Date(post.publishDate) > new Date())
    .sort(
      (left, right) =>
        new Date(left.publishDate).getTime() -
        new Date(right.publishDate).getTime(),
    )
    .slice(0, 6);

  return (
    <MarketingShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              Insights library
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
              Field notes for better launches, sharper brands, and cleaner
              production.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              Practical guidance for NY/NJ business owners who need brand,
              website, print, and marketing materials to work together.
            </p>
          </div>
          <StudioHeroVisual />
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-[76rem] gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {["Brand launch", "Website trust", "Print collateral", "Local growth"].map((track) => (
            <div key={track} className="border border-[var(--border)] bg-white p-4">
              <p className="text-sm font-semibold">{track}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
        {publishedPosts.length === 0 ? (
          <div className="grid gap-6 border border-[var(--border)] bg-white p-6 md:grid-cols-[0.8fr_1fr] md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                First editorial drop
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Publishing starts May 26.
              </h2>
            </div>
            <p className="leading-7 text-[var(--muted)]">
              The first guides focus on med spa branding, dental practice launch
              systems, and the difference between a logo and a usable brand
              identity for NY/NJ businesses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {publishedPosts.map((post) => (
              <EditorialCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-[76rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              Editorial tracks
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Written around real business decisions.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "What to prepare before opening",
                "How to make a new brand feel established",
                "Which materials belong in a launch kit",
                "How to keep web, print, and social consistent",
              ].map((item) => (
                <div key={item} className="border border-[var(--border)] bg-white p-4 text-sm font-semibold leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--border)] bg-white p-5">
            <h2 className="text-2xl font-semibold">Coming next</h2>
            <div className="mt-4 space-y-4">
              {nextPosts.map((post) => (
                <div key={post.slug} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {formatPublishDate(post.publishDate)} · {getIndustryPage(post.industrySlug)?.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6">
                    {post.title}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </MarketingShell>
  );
}
