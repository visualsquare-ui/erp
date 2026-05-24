import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import { IndustryPreview } from "@/components/marketing-visuals";
import {
  blogPosts,
  formatPublishDate,
  getBlogPost,
  getIndustryPage,
  getSiteUrl,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post || new Date(post.publishDate) > new Date()) {
    return {};
  }

  return {
    title: `${post.title} | Visual Square`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishDate,
      locale: post.language === "ko" ? "ko_KR" : "en_US",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post || new Date(post.publishDate) > new Date()) {
    notFound();
  }

  const industry = getIndustryPage(post.industrySlug);
  const siteUrl = getSiteUrl();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      "@type": "Organization",
      name: "Visual Square",
    },
    publisher: {
      "@type": "Organization",
      name: "Visual Square",
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <MarketingShell>
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <header className="bg-white">
          <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_0.75fr] lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                {post.category} · {formatPublishDate(post.publishDate)}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {post.description}
              </p>
              <p className="mt-5 text-sm font-semibold text-[var(--muted)]">
                {post.readingMinutes} min read · {post.language.toUpperCase()}
              </p>
            </div>
            {industry ? <IndustryPreview industry={industry} compact /> : null}
          </div>
        </header>

        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
          <div className="min-w-0">
            <section className="border-l-2 border-[var(--coral)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                Studio take
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Short answer</h2>
              <p className="mt-3 leading-8 text-[var(--muted)]">{post.summary}</p>
            </section>

            <section className="mt-10 border border-[var(--foreground)] bg-[var(--foreground)] p-5 text-white">
              <h2 className="text-xl font-semibold">What to remember</h2>
              <ul className="mt-4 space-y-3 leading-7 text-white/72">
                {post.keyPoints.map((point) => (
                  <li key={point} className="border-b border-white/14 pb-3 last:border-b-0 last:pb-0">
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-10 space-y-10">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-3xl font-semibold">{section.heading}</h2>
                  <div className="mt-4 space-y-4 leading-8 text-[var(--muted)]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets ? (
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="min-h-24 border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-semibold leading-6">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <section className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                Decision support
              </p>
              <h2 className="mt-3 text-3xl font-semibold">FAQ</h2>
              <div className="mt-5 space-y-4">
                {post.faq.map((item) => (
                  <div key={item.question} className="border border-[var(--border)] p-4">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 leading-7 text-[var(--muted)]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Related service
              </p>
              {industry ? (
                <>
                  <h2 className="mt-3 text-xl font-semibold">{industry.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {industry.description}
                  </p>
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="mt-5 inline-flex border border-[var(--coral)] bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--coral-strong)]"
                  >
                    View industry page
                  </Link>
                </>
              ) : null}
            </div>
            <div className="mt-4 border border-[var(--coral)] bg-[var(--coral-quiet)] p-5">
              <h2 className="text-xl font-semibold">Work with Visual Square</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Planning a launch or refresh in New York or New Jersey? We can
                help with brand identity, website design, print materials, and
                production-ready files.
              </p>
            </div>
          </aside>
        </div>
      </article>
    </MarketingShell>
  );
}
