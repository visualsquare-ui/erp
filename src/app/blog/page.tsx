import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing-shell";
import { EditorialCard, StudioHeroVisual } from "@/components/marketing-visuals";
import {
  blogPosts,
  formatPublishDate,
  getIndustryPage,
  getLocalizedIndustryPage,
  getPublishedBlogPosts,
  type Language,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design Insights Blog | Visual Square",
  description:
    "Branding, website, print, and launch design insights for businesses in New York and New Jersey.",
};

const blogCopy = {
  en: {
    eyebrow: "Insights library",
    title: "Field notes for better launches, sharper brands, and cleaner production.",
    description:
      "Practical guidance for NY/NJ business owners who need brand, website, print, and marketing materials to work together.",
    tracks: ["Brand launch", "Website trust", "Print collateral", "Local growth"],
    firstEyebrow: "First editorial drop",
    firstTitle: "Publishing starts May 26.",
    firstBody:
      "The first guides focus on med spa branding, dental practice launch systems, and the difference between a logo and a usable brand identity for NY/NJ businesses.",
    editorialEyebrow: "Editorial tracks",
    editorialTitle: "Written around real business decisions.",
    editorialItems: [
      "What to prepare before opening",
      "How to make a new brand feel established",
      "Which materials belong in a launch kit",
      "How to keep web, print, and social consistent",
    ],
    comingNext: "Coming next",
  },
  ko: {
    eyebrow: "인사이트 라이브러리",
    title: "더 나은 오픈, 더 선명한 브랜드, 더 깔끔한 제작을 위한 필드 노트.",
    description:
      "브랜드, 웹사이트, 인쇄물, 마케팅 자료가 함께 작동해야 하는 뉴욕/뉴저지 비즈니스 오너를 위한 실무형 가이드.",
    tracks: ["브랜드 런치", "웹사이트 신뢰", "인쇄물", "로컬 성장"],
    firstEyebrow: "첫 콘텐츠 발행",
    firstTitle: "5월 26일부터 발행을 시작합니다.",
    firstBody:
      "첫 글은 메디스파 브랜딩, 치과 오픈 시스템, 그리고 로고와 실제 브랜드 아이덴티티의 차이를 다룹니다.",
    editorialEyebrow: "콘텐츠 트랙",
    editorialTitle: "실제 비즈니스 결정을 기준으로 작성합니다.",
    editorialItems: [
      "오픈 전에 준비할 것",
      "새 브랜드를 안정적으로 보이게 만드는 법",
      "런치 키트에 들어가야 할 자료",
      "웹, 인쇄, 소셜을 일관되게 유지하는 법",
    ],
    comingNext: "다음 발행 예정",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

export function BlogPageContent({ language = "en" }: { language?: Language }) {
  const publishedPosts = getPublishedBlogPosts().filter(
    (post) => language === "en" || post.language === "ko",
  );
  const nextPosts = blogPosts
    .filter((post) => new Date(post.publishDate) > new Date())
    .filter((post) => language === "en" || post.language === "ko")
    .sort(
      (left, right) =>
        new Date(left.publishDate).getTime() -
        new Date(right.publishDate).getTime(),
    )
    .slice(0, 6);
  const copy = blogCopy[language];

  return (
    <MarketingShell language={language} currentPath={language === "ko" ? "/ko/blog" : "/blog"}>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              {copy.description}
            </p>
          </div>
          <StudioHeroVisual language={language} />
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-[76rem] gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {(copy.tracks as string[]).map((track) => (
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
                {copy.firstEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {copy.firstTitle}
              </h2>
            </div>
            <p className="leading-7 text-[var(--muted)]">
              {copy.firstBody}
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
              {copy.editorialEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {copy.editorialTitle}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(copy.editorialItems as string[]).map((item) => (
                <div key={item} className="border border-[var(--border)] bg-white p-4 text-sm font-semibold leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--border)] bg-white p-5">
            <h2 className="text-2xl font-semibold">{copy.comingNext}</h2>
            <div className="mt-4 space-y-4">
              {nextPosts.map((post) => (
                <div key={post.slug} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {formatPublishDate(post.publishDate)} · {language === "ko" ? getLocalizedIndustryPage(post.industrySlug, "ko")?.name : getIndustryPage(post.industrySlug)?.name}
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

export default function BlogPage() {
  return <BlogPageContent />;
}
