import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing/shell";
import { EditorialPreviewVisual } from "@/components/marketing/visuals";
import {
  blogPosts,
  formatPublishDate,
  getBlogPost,
  getBlogVisibilityDate,
  getIndustryPageKo,
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
  const industryKo = industry ? getIndustryPageKo(industry) : undefined;
  const heroImageSrc = industry?.visualTheme.imageSrc ?? "/marketing/brand-launch-kit.png";
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
              <EditorialPreviewVisual post={post} mode="hero" />
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

          <section className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border border-[var(--border)] bg-white p-6">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="What this article covers"
                data-ko="이 글에서 다루는 내용"
              >
                What this article covers
              </p>
              <ul className="mt-4 grid gap-3">
                {post.keyPoints.map((point, pointIndex) => (
                  <li
                    key={point}
                    className="border border-[var(--border)] bg-[var(--surface)] p-4 text-base leading-7 text-[var(--foreground)]"
                    data-en={point}
                    data-ko={koPost?.keyPoints[pointIndex] ?? point}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                  data-en="Best fit"
                  data-ko="추천 대상"
                >
                  Best fit
                </p>
                <p
                  className="mt-4 text-base leading-7 text-[var(--muted)]"
                  data-en={
                    industry?.audience ??
                    "For owners preparing a launch, refresh, or stronger customer-facing presence."
                  }
                  data-ko={
                    industryKo?.audience ??
                    "오픈, 리프레시, 또는 더 강한 고객 접점이 필요한 오너에게 적합합니다."
                  }
                >
                  {industry?.audience ??
                    "For owners preparing a launch, refresh, or stronger customer-facing presence."}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-white p-6">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                  data-en="Priority assets"
                  data-ko="우선 준비 자산"
                >
                  Priority assets
                </p>
                <ul className="mt-4 grid gap-2.5">
                  {(industry?.deliverables ?? []).slice(0, 5).map((item, index) => (
                    <li
                      key={item}
                      className="border-b border-[var(--border)] pb-2 text-sm font-semibold leading-6 text-[var(--foreground)] last:border-b-0 last:pb-0"
                      data-en={item}
                      data-ko={industryKo?.deliverables[index] ?? item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

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

          <section className="mt-14 border-t border-[var(--border)] pt-10">
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en="Frequently asked questions"
              data-ko="자주 묻는 질문"
            >
              Frequently asked questions
            </p>
            <div className="mt-5 grid gap-4">
              {post.faq.map((item) => (
                <article
                  key={item.question}
                  className="border border-[var(--border)] bg-white p-5"
                >
                  <h2 className="text-xl font-semibold leading-7 text-[var(--foreground)]">
                    {item.question}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {industry ? (
            <section className="mt-14 border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Launch guidance"
                data-ko="런칭 가이드"
              >
                Launch guidance
              </p>
              <h2
                className="mt-3 text-3xl font-semibold leading-tight"
                data-en="Build the brand, web, and print system together."
                data-ko="브랜드, 웹, 인쇄 시스템을 함께 설계해야 합니다."
              >
                Build the brand, web, and print system together.
              </h2>
              <p
                className="mt-4 text-lg leading-8 text-[var(--muted)]"
                data-en="The strongest NY/NJ launches do not treat the website, printed materials, and campaign assets as separate projects. They move faster when the identity, page structure, collateral, and production-ready files are planned as one usable system."
                data-ko="강한 뉴욕/뉴저지 런칭은 웹사이트, 인쇄물, 캠페인 자산을 따로 만들지 않습니다. 아이덴티티, 페이지 구조, 인쇄물, 제작 파일을 하나의 시스템으로 계획할 때 더 빠르고 안정적으로 진행됩니다."
              >
                The strongest NY/NJ launches do not treat the website, printed
                materials, and campaign assets as separate projects. They move
                faster when the identity, page structure, collateral, and
                production-ready files are planned as one usable system.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {industry.outcomes.map((outcome, index) => (
                  <p
                    key={outcome}
                    className="border border-[var(--border)] bg-white p-4 text-base leading-7 text-[var(--foreground)]"
                    data-en={outcome}
                    data-ko={industryKo?.outcomes[index] ?? outcome}
                  >
                    {outcome}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </MarketingShell>
  );
}
