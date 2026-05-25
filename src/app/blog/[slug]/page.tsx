import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import {
  blogPosts,
  formatPublishDate,
  getBlogPost,
  getBlogVisibilityDate,
  getSiteUrl,
  industryPages,
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
  const blogNow = getBlogVisibilityDate();

  if (!post || new Date(post.publishDate) > blogNow) {
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
      images: [`${getSiteUrl()}${industryPages.find((industry) => industry.slug === post.industrySlug)?.visualTheme.imageSrc ?? "/marketing/brand-launch-kit.png"}`],
    },
  };
}

function formatKoreanPublishDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const blogNow = getBlogVisibilityDate();

  if (!post || new Date(post.publishDate) > blogNow) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const industry = industryPages.find((item) => item.slug === post.industrySlug);
  const heroImageSrc = industry?.visualTheme.imageSrc ?? "/marketing/brand-launch-kit.png";
  const heroImageAlt = industry
    ? `${industry.name} brand launch kit with website, printed service menu, appointment cards, and social assets`
    : "Brand launch kit with website, print materials, and social assets";
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
    image: `${siteUrl}${heroImageSrc}`,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
  const koPost = post.ko;

  return (
    <MarketingShell>
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <header className="bg-white">
          <div className="mx-auto max-w-[76rem] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
            <figure className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <Image
                src={heroImageSrc}
                alt={heroImageAlt}
                width={1586}
                height={992}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          </div>
          <div className="mx-auto max-w-[52rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en={`Article · ${formatPublishDate(post.publishDate)}`}
              data-ko={`글 · ${formatKoreanPublishDate(post.publishDate)}`}
            >
              Article · {formatPublishDate(post.publishDate)}
            </p>
            <h1
              className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl"
              data-en={post.title}
              data-ko={koPost?.title ?? post.title}
            >
              {post.title}
            </h1>
            <p
              className="mt-6 text-xl leading-8 text-[var(--muted)]"
              data-en={post.description}
              data-ko={koPost?.description ?? post.description}
            >
              {post.description}
            </p>
            <p
              className="mt-5 text-sm font-semibold text-[var(--muted)]"
              data-en={`${post.readingMinutes} min read`}
              data-ko={`${post.readingMinutes}분 읽기`}
            >
              {post.readingMinutes} min read
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[52rem] px-4 pb-16 sm:px-6 lg:px-8">
          <p
            className="border-l-2 border-[var(--coral)] bg-[var(--surface)] p-5 text-lg leading-8 text-[var(--foreground)]"
            data-en={post.summary}
            data-ko={koPost?.summary ?? post.summary}
          >
            {post.summary}
          </p>

          {post.keyPoints.length > 0 ? (
            <ul className="mt-8 grid gap-3">
              {post.keyPoints.map((point, index) => (
                <li
                  key={point}
                  className="flex gap-3 border border-[var(--border)] bg-[var(--surface)] p-4 text-base leading-7"
                  data-en={point}
                  data-ko={koPost?.keyPoints[index] ?? point}
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--coral)]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-12 space-y-12">
            {post.sections.map((section, sectionIndex) => {
              const koSection = koPost?.sections[sectionIndex];

              return (
              <section key={section.heading}>
                <h2
                  className="text-3xl font-semibold leading-tight"
                  data-en={section.heading}
                  data-ko={koSection?.heading ?? section.heading}
                >
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-lg leading-8 text-[var(--muted)]">
                  {section.body.map((paragraph, paragraphIndex) => (
                    <p
                      key={paragraph}
                      data-en={paragraph}
                      data-ko={koSection?.body[paragraphIndex] ?? paragraph}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-6 grid gap-3">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bullet}
                        className="border border-[var(--border)] bg-white p-4 text-base font-semibold leading-7"
                        data-en={bullet}
                        data-ko={koSection?.bullets?.[bulletIndex] ?? bullet}
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
            })}
          </div>

          {post.faq.length > 0 ? (
            <section className="mt-16 border-t border-[var(--border)] pt-12">
              <h2
                className="text-3xl font-semibold"
                data-en="Frequently asked questions"
                data-ko="자주 묻는 질문"
              >
                Frequently asked questions
              </h2>
              <dl className="mt-8 space-y-6">
                {post.faq.map((item) => (
                  <div key={item.question} className="border border-[var(--border)] bg-[var(--surface)] p-6">
                    <dt className="text-base font-semibold leading-7">
                      {item.question}
                    </dt>
                    <dd className="mt-3 text-base leading-7 text-[var(--muted)]">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </article>
    </MarketingShell>
  );
}
