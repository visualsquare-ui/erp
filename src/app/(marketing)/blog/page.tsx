import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/shell";
import { EditorialCard } from "@/components/marketing/visuals";
import {
  getBlogVisibilityDate,
  getPublishedBlogPosts,
  industryPages,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Visual Square",
  description:
    "Branding, website, print, and launch design insights for businesses in New York and New Jersey.",
};

export default function BlogPage() {
  const blogNow = getBlogVisibilityDate();
  const publishedPosts = getPublishedBlogPosts(blogNow);
  const featuredPost = publishedPosts[0];
  const featuredIndustry = featuredPost
    ? industryPages.find((industry) => industry.slug === featuredPost.industrySlug)
    : null;
  const featuredImageSrc =
    featuredIndustry?.visualTheme.imageSrc ?? "/marketing/brand-launch-kit.png";

  return (
    <MarketingShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.86fr_1fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en="Blog"
              data-ko="블로그"
            >
              Blog
            </p>
            <h1
              className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl"
              data-en="Design notes, not lectures."
              data-ko="길게 설명하지 않는 디자인 노트."
            >
              Design notes, not lectures.
            </h1>
            <p
              className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]"
              data-en="Practical visual direction for launch kits, websites, print materials, and local business growth."
              data-ko="런치킷, 웹사이트, 인쇄물, 로컬 비즈니스 성장을 위한 실용적인 비주얼 방향을 정리합니다."
            >
              Practical visual direction for launch kits, websites, print
              materials, and local business growth.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-[var(--border)] text-sm">
              {[
                { label: "Brand", ko: "브랜드" },
                { label: "Web", ko: "웹" },
                { label: "Print", ko: "인쇄" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-r border-[var(--border)] py-4 pr-4 last:border-r-0"
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                    data-en="Notes"
                    data-ko="노트"
                  >
                    Notes
                  </p>
                  <p
                    className="mt-1 text-xl font-semibold"
                    data-en={item.label}
                    data-ko={item.ko}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <figure className="relative overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <Image
              src={featuredImageSrc}
              alt="Visual Square article preview with brand, website, print, and launch materials"
              width={1586}
              height={992}
              priority
              className="aspect-[16/10] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-4 bottom-4 border border-white/60 bg-white/90 p-4 backdrop-blur">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Editorial focus"
                data-ko="에디토리얼 포커스"
              >
                Editorial focus
              </p>
              <p
                className="mt-1 text-sm font-semibold"
                data-en="Brand systems, service pages, printed touchpoints, and launch-ready files."
                data-ko="브랜드 시스템, 서비스 페이지, 인쇄 접점, 런치 준비 파일을 다룹니다."
              >
                Brand systems, service pages, printed touchpoints, and
                launch-ready files.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Latest articles"
                data-ko="최신 글"
              >
                Latest articles
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                data-en="Guides for real business launch decisions."
                data-ko="실제 비즈니스 런칭 결정을 위한 가이드."
              >
                Guides for real business launch decisions.
              </h2>
            </div>
            {featuredPost ? (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-semibold hover:border-[var(--coral)] hover:text-[var(--coral-strong)]"
                data-en="Start with the latest"
                data-ko="최신 글부터 보기"
              >
                Start with the latest
              </Link>
            ) : null}
          </div>
          {publishedPosts.length === 0 ? (
            <div className="mt-6 border border-[var(--border)] bg-white p-6 md:p-8">
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="First article"
                data-ko="첫 글"
              >
                First article
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                data-en="Publishing starts May 26."
                data-ko="5월 26일부터 발행합니다."
              >
                Publishing starts May 26.
              </h2>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publishedPosts.map((post) => (
                <EditorialCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
