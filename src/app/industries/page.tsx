import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import {
  IndustryCard,
  StudioHeroVisual,
  StudioProcessFlow,
} from "@/components/marketing-visuals";
import {
  getLocalizedIndustryPages,
  getLocalizedStudioProcessSteps,
  type Language,
} from "@/content/marketing-content";

export const metadata: Metadata = {
  title: "Industries | Visual Square",
  description:
    "Brand identity, website design, print design, and production-ready visual assets for NY/NJ businesses.",
};

const pageCopy = {
  en: {
    eyebrow: "NY/NJ design partner",
    title: "Launch-ready visual systems for businesses that need to look established.",
    description:
      "Visual Square builds brand identity, websites, print collateral, campaign assets, and production-ready files as one connected system.",
    primaryCta: "Explore industries",
    secondaryCta: "Read insights",
    system: "System",
    systems: ["Brand", "Web", "Print"],
    methodEyebrow: "Studio method",
    methodTitle: "Not one-off graphics. A usable launch kit.",
    methodBody:
      "Each industry page is shaped around the materials a business actually needs to sell, book, explain, promote, and hand off to vendors.",
    contactEyebrow: "Start a project",
    contactTitle:
      "Need a launch kit, brand refresh, or production-ready design package?",
    contactBody:
      "Use the industry pages as a starting point. Visual Square can shape the brand, website, print collateral, and vendor-ready files around what your business needs to launch or grow.",
    processEyebrow: "How projects move",
    processTitle: "From owner ideas to launch-ready assets.",
    processBody:
      "The goal is not to force a preset style. We first organize what the owner wants, diagnose what the business needs, compare directions, choose the strongest path, and keep improving the brand after launch.",
  },
  ko: {
    eyebrow: "뉴욕/뉴저지 디자인 파트너",
    title: "오픈 준비가 된 브랜드, 웹, 인쇄 디자인 시스템.",
    description:
      "Visual Square는 브랜드 아이덴티티, 웹사이트, 인쇄물, 캠페인 자료, 제작용 파일을 하나의 연결된 시스템으로 준비합니다.",
    primaryCta: "업종별 페이지 보기",
    secondaryCta: "인사이트 읽기",
    system: "시스템",
    systems: ["브랜드", "웹", "인쇄"],
    methodEyebrow: "스튜디오 방식",
    methodTitle: "단발성 그래픽이 아니라 실제로 쓰이는 런치 키트.",
    methodBody:
      "각 업종 페이지는 실제 비즈니스가 판매, 예약, 설명, 홍보, 벤더 전달에 필요한 자료를 기준으로 구성됩니다.",
    contactEyebrow: "프로젝트 시작",
    contactTitle: "런치 키트, 브랜드 리뉴얼, 제작 가능한 디자인 패키지가 필요하신가요?",
    contactBody:
      "업종별 페이지를 출발점으로 삼아 브랜드, 웹사이트, 인쇄물, 벤더 전달용 파일을 비즈니스 상황에 맞게 구성할 수 있습니다.",
    processEyebrow: "프로젝트 진행 방식",
    processTitle: "대표의 아이디어에서 런치 준비가 된 결과물까지.",
    processBody:
      "정해진 스타일을 강요하지 않습니다. 먼저 대표가 원하는 방향을 정리하고, 비즈니스에 필요한 것을 진단한 뒤, 방향을 비교하고 가장 강한 안을 선택해 런치 이후에도 계속 개선합니다.",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

export function IndustriesPageContent({ language = "en" }: { language?: Language }) {
  const copy = pageCopy[language];
  const industries = getLocalizedIndustryPages(language);

  return (
    <MarketingShell language={language} currentPath={language === "ko" ? "/ko/industries" : "/industries"}>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--foreground)] sm:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {copy.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#industry-systems"
                  className="border border-[var(--coral)] bg-[var(--coral)] px-5 py-3 text-sm font-semibold !text-white hover:border-[var(--coral-strong)] hover:bg-[var(--coral-strong)]"
                >
                  {copy.primaryCta}
                </Link>
                <Link
                  href={language === "ko" ? "/ko/blog" : "/blog"}
                  className="border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold hover:border-[var(--coral)] hover:text-[var(--coral-strong)]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-3 border-y border-[var(--border)] text-sm">
              {(copy.systems as string[]).map((item) => (
                <div key={item} className="border-r border-[var(--border)] py-4 pr-4 last:border-r-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {copy.system}
                  </p>
                  <p className="mt-1 text-xl font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <StudioHeroVisual language={language} />
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[76rem] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
                {copy.methodEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {copy.methodTitle}
              </h2>
            </div>
            <p className="leading-7 text-[var(--muted)]">
              {copy.methodBody}
            </p>
          </div>
        </div>
      </section>

      <StudioProcessFlow
        steps={getLocalizedStudioProcessSteps(language)}
        eyebrow={copy.processEyebrow as string}
        title={copy.processTitle as string}
        description={copy.processBody as string}
        language={language}
      />

      <section id="industry-systems" className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-[var(--border)] bg-[var(--coral-quiet)]">
        <div className="mx-auto grid max-w-[76rem] gap-6 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1fr] md:items-end lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              {copy.contactEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {copy.contactTitle}
            </h2>
          </div>
          <p className="leading-7 text-[var(--muted)]">
            {copy.contactBody}
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}

export default function IndustriesPage() {
  return <IndustriesPageContent />;
}
