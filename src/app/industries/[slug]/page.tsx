import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import {
  IndustryPreview,
  StudioProcessFlow,
} from "@/components/marketing-visuals";
import {
  formatPublishDate,
  getIndustryPage,
  getRelatedPostsForIndustry,
  industryPages,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return industryPages.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryPage(slug);

  if (!industry) {
    return {};
  }

  return {
    title: `${industry.name} Branding and Design | Visual Square`,
    description: industry.description,
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustryPage(slug);

  if (!industry) {
    notFound();
  }

  const relatedPosts = getRelatedPostsForIndustry(industry.slug);

  return (
    <MarketingShell>
      <article>
        <header className="bg-white">
          <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                {industry.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
                {industry.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {industry.description}
              </p>
              <div className="mt-8 border-l-2 border-[var(--coral)] pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Design direction
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {industry.visualTheme.mood}
                </p>
                <p className="mt-3 leading-7 text-[var(--muted)]">
                  {industry.audience}
                </p>
              </div>
            </div>
            <IndustryPreview industry={industry} />
          </div>
        </header>

        <StudioProcessFlow
          steps={industry.processSteps}
          eyebrow={`${industry.name} process`}
          title={`How ${industry.name.toLowerCase()} projects move from idea to launch.`}
          description={`The framework stays disciplined, but the details change for ${industry.name.toLowerCase()} businesses. We diagnose the audience, touchpoints, and launch risks before turning the direction into practical brand, web, print, and content assets.`}
        />

        <section className="mx-auto grid max-w-[76rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              Service mix
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              What Visual Square designs for {industry.name.toLowerCase()} brands
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {industry.services.map((service) => (
                <div key={service} className="border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--coral)]">
                  <p className="font-semibold">{service}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--foreground)] bg-[var(--foreground)] p-5 text-white">
            <h2 className="text-xl font-semibold">What this should change</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {industry.outcomes.map((outcome) => (
                <li key={outcome} className="border-b border-white/16 pb-3 text-white/72 last:border-b-0 last:pb-0">
                  {outcome}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              Launch assets
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Common deliverables</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {industry.deliverables.map((deliverable) => (
                <div key={deliverable} className="min-h-24 bg-white p-4 text-sm font-semibold leading-6">
                  {deliverable}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                Practical questions
              </p>
              <h2 className="mt-3 text-3xl font-semibold">FAQ</h2>
              <div className="mt-5 space-y-4">
                {industry.faq.map((item) => (
                  <div key={item.question} className="border border-[var(--border)] p-4">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                Editorial support
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Related insights</h2>
              {relatedPosts.length === 0 ? (
                <p className="mt-5 leading-7 text-[var(--muted)]">
                  Related articles are scheduled in the launch calendar and will
                  appear here as they publish.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block border border-[var(--border)] p-4 transition-colors hover:border-[var(--coral)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {formatPublishDate(post.publishDate)} · {post.category}
                      </p>
                      <h3 className="mt-2 font-semibold">{post.title}</h3>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div id="contact" className="mt-12 border border-[var(--coral)] bg-[var(--coral-quiet)] p-6 md:p-8">
            <h2 className="text-3xl font-semibold">Planning a launch or refresh?</h2>
            <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
              Visual Square can help with brand identity, website design, print
              materials, and production-ready visual assets for NY/NJ businesses.
            </p>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
