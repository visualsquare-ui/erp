import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing/shell";
import {
  IndustryPreview,
  StudioProcessFlow,
} from "@/components/marketing/visuals";
import {
  formatPublishDate,
  getIndustryPage,
  getIndustryPageKo,
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
  const industryKo = getIndustryPageKo(industry);

  return (
    <MarketingShell>
      <article>
        <header className="bg-white">
          <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8 lg:py-16">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en={industry.eyebrow}
                data-ko={industryKo?.eyebrow ?? industry.eyebrow}
              >
                {industry.eyebrow}
              </p>
              <h1
                className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl"
                data-en={industry.title}
                data-ko={industryKo?.title ?? industry.title}
              >
                {industry.title}
              </h1>
              <p
                className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]"
                data-en={industry.description}
                data-ko={industryKo?.description ?? industry.description}
              >
                {industry.description}
              </p>
              <div className="mt-8 border-l-2 border-[var(--coral)] pl-4">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                  data-en="Design direction"
                  data-ko="디자인 방향"
                >
                  Design direction
                </p>
                <p
                  className="mt-2 text-xl font-semibold"
                  data-en={industry.visualTheme.mood}
                  data-ko={industryKo?.visualTheme.mood ?? industry.visualTheme.mood}
                >
                  {industry.visualTheme.mood}
                </p>
                <p
                  className="mt-3 leading-7 text-[var(--muted)]"
                  data-en={industry.audience}
                  data-ko={industryKo?.audience ?? industry.audience}
                >
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
          koEyebrow={`${industryKo?.name ?? industry.name} 프로세스`}
          koTitle={`${industryKo?.name ?? industry.name} 프로젝트를 아이디어에서 런칭까지 정리하는 방식.`}
          koDescription={`${industryKo?.name ?? industry.name} 업종에 맞춰 고객, 접점, 런칭 리스크를 먼저 진단한 뒤 브랜드, 웹, 인쇄, 콘텐츠 자산으로 실행합니다.`}
        />

        <section className="mx-auto grid max-w-[76rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en="Service mix"
              data-ko="서비스 구성"
            >
              Service mix
            </p>
            <h2
              className="mt-3 text-3xl font-semibold"
              data-en={`What Visual Square designs for ${industry.name.toLowerCase()} brands`}
              data-ko={`Visual Square가 ${industryKo?.name ?? industry.name} 브랜드를 위해 디자인하는 것`}
            >
              What Visual Square designs for {industry.name.toLowerCase()} brands
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {industry.services.map((service, index) => (
                <div key={service} className="border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--coral)]">
                  <p
                    className="font-semibold"
                    data-en={service}
                    data-ko={industryKo?.services[index] ?? service}
                  >
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--foreground)] bg-[var(--foreground)] p-5 text-white">
            <h2
              className="text-xl font-semibold"
              data-en="What this should change"
              data-ko="이 작업이 바꿔야 하는 것"
            >
              What this should change
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {industry.outcomes.map((outcome, index) => (
                <li
                  key={outcome}
                  className="border-b border-white/16 pb-3 text-white/72 last:border-b-0 last:pb-0"
                  data-en={outcome}
                  data-ko={industryKo?.outcomes[index] ?? outcome}
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en="Launch assets"
              data-ko="런칭 자산"
            >
              Launch assets
            </p>
            <h2
              className="mt-3 text-3xl font-semibold"
              data-en="Common deliverables"
              data-ko="주요 결과물"
            >
              Common deliverables
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {industry.deliverables.map((deliverable, index) => (
                <div
                  key={deliverable}
                  className="min-h-24 bg-white p-4 text-sm font-semibold leading-6"
                  data-en={deliverable}
                  data-ko={industryKo?.deliverables[index] ?? deliverable}
                >
                  {deliverable}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Practical questions"
                data-ko="실무 질문"
              >
                Practical questions
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                data-en="FAQ"
                data-ko="자주 묻는 질문"
              >
                FAQ
              </h2>
              <div className="mt-5 space-y-4">
                {industry.faq.map((item, index) => (
                  <div key={item.question} className="border border-[var(--border)] p-4">
                    <h3
                      className="font-semibold"
                      data-en={item.question}
                      data-ko={industryKo?.faq[index]?.question ?? item.question}
                    >
                      {item.question}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-6 text-[var(--muted)]"
                      data-en={item.answer}
                      data-ko={industryKo?.faq[index]?.answer ?? item.answer}
                    >
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
                data-en="Editorial support"
                data-ko="관련 인사이트"
              >
                Editorial support
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                data-en="Related insights"
                data-ko="관련 글"
              >
                Related insights
              </h2>
              {relatedPosts.length === 0 ? (
                <p
                  className="mt-5 leading-7 text-[var(--muted)]"
                  data-en="Related articles are scheduled in the launch calendar and will appear here as they publish."
                  data-ko="관련 글은 발행 일정에 맞춰 공개되며, 발행 후 이곳에 표시됩니다."
                >
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
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                        data-en={`${formatPublishDate(post.publishDate)} · ${post.category}`}
                        data-ko={`${formatPublishDate(post.publishDate)} · ${post.ko?.category ?? post.category}`}
                      >
                        {formatPublishDate(post.publishDate)} · {post.category}
                      </p>
                      <h3
                        className="mt-2 font-semibold"
                        data-en={post.title}
                        data-ko={post.ko?.title ?? post.title}
                      >
                        {post.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div id="contact" className="mt-12 border border-[var(--coral)] bg-[var(--coral-quiet)] p-6 md:p-8">
            <h2
              className="text-3xl font-semibold"
              data-en="Planning a launch or refresh?"
              data-ko="런칭이나 리프레시를 준비 중이신가요?"
            >
              Planning a launch or refresh?
            </h2>
            <p
              className="mt-3 max-w-3xl leading-7 text-[var(--muted)]"
              data-en="Visual Square can help with brand identity, website design, print materials, and production-ready visual assets for NY/NJ businesses."
              data-ko="Visual Square는 뉴욕/뉴저지 비즈니스를 위한 브랜드 아이덴티티, 웹사이트 디자인, 인쇄물, 제작 준비 비주얼 자산을 함께 정리합니다."
            >
              Visual Square can help with brand identity, website design, print
              materials, and production-ready visual assets for NY/NJ businesses.
            </p>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
