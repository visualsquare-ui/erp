import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/shell";
import {
  IndustryCard,
  StudioHeroVisual,
  StudioProcessFlow,
} from "@/components/marketing/visuals";
import { industryPages } from "@/content/marketing-content";

export const metadata: Metadata = {
  title: "Industries | Visual Square",
  description:
    "Brand identity, website design, print design, and production-ready visual assets for NY/NJ businesses.",
};

export default function IndustriesPage() {
  return (
    <MarketingShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="NY/NJ design partner"
                data-ko="뉴욕/뉴저지 디자인 파트너"
              >
                NY/NJ design partner
              </p>
              <h1
                className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--foreground)] sm:text-6xl"
                data-en="Launch-ready design systems."
                data-ko="런칭 준비 디자인 시스템."
              >
                Launch-ready design systems.
              </h1>
              <p
                className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]"
                data-en="Visual Square builds brand identity, websites, print collateral, campaign assets, and production-ready files as one connected system."
                data-ko="Visual Square는 브랜드 아이덴티티, 웹사이트, 인쇄물, 캠페인 자산, 제작 준비 파일을 하나의 연결된 시스템으로 만듭니다."
              >
                Visual Square builds brand identity, websites, print collateral,
                campaign assets, and production-ready files as one connected
                system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#industry-systems"
                  className="border border-[var(--coral)] bg-[var(--coral)] px-5 py-3 text-sm font-semibold !text-white hover:border-[var(--coral-strong)] hover:bg-[var(--coral-strong)]"
                  data-en="Explore industries"
                  data-ko="업종별 보기"
                >
                  Explore industries
                </Link>
                <Link
                  href="/blog"
                  className="border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold hover:border-[var(--coral)] hover:text-[var(--coral-strong)]"
                  data-en="Read insights"
                  data-ko="인사이트 읽기"
                >
                  Read insights
                </Link>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-3 border-y border-[var(--border)] text-sm">
              {[
                { label: "Brand", ko: "브랜드" },
                { label: "Web", ko: "웹" },
                { label: "Print", ko: "인쇄" },
              ].map((item) => (
                <div key={item.label} className="border-r border-[var(--border)] py-4 pr-4 last:border-r-0">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                    data-en="System"
                    data-ko="시스템"
                  >
                    System
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
          <StudioHeroVisual />
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[76rem] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-end">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Studio method"
                data-ko="스튜디오 방식"
              >
                Studio method
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                data-en="Not one-off graphics. A usable launch kit."
                data-ko="단발성 그래픽이 아니라 실제로 쓰이는 런치킷."
              >
                Not one-off graphics. A usable launch kit.
              </h2>
            </div>
            <p
              className="leading-7 text-[var(--muted)]"
              data-en="Each industry page is shaped around the materials a business actually needs to sell, book, explain, promote, and hand off to vendors."
              data-ko="각 업종 페이지는 판매, 예약, 설명, 홍보, 벤더 전달에 실제로 필요한 자료를 기준으로 구성됩니다."
            >
              Each industry page is shaped around the materials a business
              actually needs to sell, book, explain, promote, and hand off to
              vendors.
            </p>
          </div>
        </div>
      </section>

      <StudioProcessFlow />

      <section id="industry-systems" className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {industryPages.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-[var(--border)] bg-[var(--coral-quiet)]">
        <div className="mx-auto grid max-w-[76rem] gap-6 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1fr] md:items-end lg:px-8">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en="Start a project"
              data-ko="프로젝트 시작"
            >
              Start a project
            </p>
            <h2
              className="mt-3 text-3xl font-semibold"
              data-en="Need a launch kit, brand refresh, or production-ready design package?"
              data-ko="런치킷, 브랜드 리프레시, 제작 준비 디자인 패키지가 필요하신가요?"
            >
              Need a launch kit, brand refresh, or production-ready design
              package?
            </h2>
          </div>
          <p
            className="leading-7 text-[var(--muted)]"
            data-en="Use the industry pages as a starting point. Visual Square can shape the brand, website, print collateral, and vendor-ready files around what your business needs to launch or grow."
            data-ko="업종 페이지를 출발점으로 삼아 보세요. Visual Square는 런칭과 성장을 위해 필요한 브랜드, 웹사이트, 인쇄물, 벤더 전달 파일을 함께 정리합니다."
          >
            Use the industry pages as a starting point. Visual Square can shape
            the brand, website, print collateral, and vendor-ready files around
            what your business needs to launch or grow.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
