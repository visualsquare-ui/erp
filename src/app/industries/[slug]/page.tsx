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
  getLocalizedIndustryPage,
  getRelatedPostsForIndustry,
  industryPages,
  type Language,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const detailCopy = {
  en: {
    direction: "Design direction",
    serviceMix: "Service mix",
    designsFor: (name: string) => `What Visual Square designs for ${name.toLowerCase()} brands`,
    outcomes: "What this should change",
    assets: "Launch assets",
    deliverables: "Common deliverables",
    questions: "Practical questions",
    related: "Editorial support",
    relatedTitle: "Related insights",
    relatedEmpty:
      "Related articles are scheduled in the launch calendar and will appear here as they publish.",
    contactTitle: "Planning a launch or refresh?",
    contactBody:
      "Visual Square can help with brand identity, website design, print materials, and production-ready visual assets for NY/NJ businesses.",
    processTitle: (name: string) => `How ${name.toLowerCase()} projects move from idea to launch.`,
    processBody: (name: string) =>
      `The framework stays disciplined, but the details change for ${name.toLowerCase()} businesses. We diagnose the audience, touchpoints, and launch risks before turning the direction into practical brand, web, print, and content assets.`,
    processEyebrow: (name: string) => `${name} process`,
  },
  ko: {
    direction: "디자인 방향",
    serviceMix: "서비스 구성",
    designsFor: (name: string) => `Visual Square가 ${name} 브랜드를 위해 준비하는 것`,
    outcomes: "이 작업이 바꿔야 하는 것",
    assets: "런치 자산",
    deliverables: "주요 결과물",
    questions: "자주 묻는 질문",
    related: "콘텐츠 지원",
    relatedTitle: "관련 인사이트",
    relatedEmpty:
      "관련 글은 콘텐츠 캘린더에 맞춰 발행되며, 발행 후 이 영역에 표시됩니다.",
    contactTitle: "오픈이나 리뉴얼을 준비 중인가요?",
    contactBody:
      "Visual Square는 뉴욕/뉴저지 비즈니스를 위한 브랜드 아이덴티티, 웹사이트, 인쇄물, 제작용 디자인 자산을 함께 준비할 수 있습니다.",
    processTitle: (name: string) => `${name} 프로젝트가 아이디어에서 런치까지 진행되는 방식.`,
    processBody: (name: string) =>
      `기본 프레임워크는 유지하되 ${name} 비즈니스에 맞춰 세부 내용은 달라집니다. 고객층, 접점, 런치 리스크를 먼저 진단한 뒤 브랜드, 웹, 인쇄물, 콘텐츠 자산으로 구체화합니다.`,
    processEyebrow: (name: string) => `${name} 프로세스`,
  },
} satisfies Record<Language, Record<string, string | ((name: string) => string)>>;

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

export async function IndustryPageContent({
  slug,
  language = "en",
}: {
  slug: string;
  language?: Language;
}) {
  const industry = getLocalizedIndustryPage(slug, language);

  if (!industry) {
    notFound();
  }

  const relatedPosts = getRelatedPostsForIndustry(industry.slug);
  const copy = detailCopy[language];
  const currentPath = `${language === "ko" ? "/ko" : ""}/industries/${industry.slug}`;

  return (
    <MarketingShell language={language} currentPath={currentPath}>
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
                  {copy.direction as string}
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
          eyebrow={(copy.processEyebrow as (name: string) => string)(industry.name)}
          title={(copy.processTitle as (name: string) => string)(industry.name)}
          description={(copy.processBody as (name: string) => string)(industry.name)}
          language={language}
        />

        <section className="mx-auto grid max-w-[76rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]">
              {copy.serviceMix as string}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {(copy.designsFor as (name: string) => string)(industry.name)}
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
            <h2 className="text-xl font-semibold">{copy.outcomes as string}</h2>
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
              {copy.assets as string}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{copy.deliverables as string}</h2>
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
                {copy.questions as string}
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
                {copy.related as string}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{copy.relatedTitle as string}</h2>
              {relatedPosts.length === 0 ? (
                <p className="mt-5 leading-7 text-[var(--muted)]">
                  {copy.relatedEmpty as string}
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`${language === "ko" ? "/ko" : ""}/blog/${post.slug}`}
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
            <h2 className="text-3xl font-semibold">{copy.contactTitle as string}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
              {copy.contactBody as string}
            </p>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  return <IndustryPageContent slug={slug} />;
}
