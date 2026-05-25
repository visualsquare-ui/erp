import Image from "next/image";
import Link from "next/link";

import {
  getIndustryPageKo,
  getStudioProcessStepKo,
  industryPages,
  studioProcessSteps,
  type BlogPost,
  type IndustryPage,
  type StudioProcessStep,
} from "@/content/marketing-content";

export function StudioHeroVisual() {
  return (
    <figure className="relative overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      <Image
        src="/marketing/brand-launch-kit.png"
        alt="Brand launch kit with website, brand guidelines, print materials, and social assets"
        width={1586}
        height={992}
        priority
        className="aspect-[16/10] h-full w-full object-cover"
      />
      <figcaption className="absolute inset-x-4 bottom-4 border border-white/60 bg-white/88 p-4 backdrop-blur">
        <p
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
          data-en="Launch kit preview"
          data-ko="런치킷 미리보기"
        >
          Launch kit preview
        </p>
        <p
          className="mt-1 text-sm font-semibold text-[var(--foreground)]"
          data-en="Website, brand guide, service menu, cards, social assets, and production-ready print files."
          data-ko="웹사이트, 브랜드 가이드, 서비스 메뉴, 카드, 소셜 자산, 제작 준비 인쇄 파일."
        >
          Website, brand guide, service menu, cards, social assets, and
          production-ready print files.
        </p>
      </figcaption>
      <div className="absolute left-4 top-4 hidden gap-2 sm:flex">
        {[
          { label: "Brand", ko: "브랜드" },
          { label: "Web", ko: "웹" },
          { label: "Print", ko: "인쇄" },
        ].map((item) => (
          <span
            key={item.label}
            className="border border-white/60 bg-white/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)] backdrop-blur"
            data-en={item.label}
            data-ko={item.ko}
          >
            {item.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

export function IndustryPreview({
  industry,
  compact = false,
}: {
  industry: IndustryPage;
  compact?: boolean;
}) {
  const industryKo = getIndustryPageKo(industry);

  return (
    <div
      className={`relative overflow-hidden border border-[var(--border)] bg-[var(--surface)] ${
        compact ? "min-h-[17rem]" : "min-h-[28rem]"
      }`}
    >
      <Image
        src={industry.visualTheme.imageSrc}
        alt={`${industry.name} branding, web, and print launch kit`}
        width={1586}
        height={992}
        className={
          compact
            ? "h-56 w-full object-cover"
            : "aspect-[16/10] w-full object-cover"
        }
      />
      <div className="absolute inset-x-3 bottom-3 border border-white/60 bg-white/88 p-3 backdrop-blur">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--coral-strong)]"
          data-en={industry.visualTheme.mood}
          data-ko={industryKo?.visualTheme.mood ?? industry.visualTheme.mood}
        >
          {industry.visualTheme.mood}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {industry.visualTheme.previewItems.slice(0, compact ? 3 : 4).map((item, index) => (
            <span
              key={item}
              className="border border-[var(--border)] bg-white px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]"
              data-en={item}
              data-ko={industryKo?.visualTheme.previewItems[index] ?? item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute left-3 top-3 flex gap-1.5">
        {industry.visualTheme.palette.map((color) => (
          <span
            key={color}
            className="h-6 w-6 border border-white/70"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

export function IndustryCard({ industry }: { industry: IndustryPage }) {
  const industryKo = getIndustryPageKo(industry);

  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group grid min-h-[24rem] border border-[var(--border)] bg-white transition-colors hover:border-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
    >
      <IndustryPreview industry={industry} compact />
      <div className="border-t border-[var(--border)] p-5">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--coral-strong)]"
          data-en={industry.eyebrow}
          data-ko={industryKo?.eyebrow ?? industry.eyebrow}
        >
          {industry.eyebrow}
        </p>
        <h2
          className="mt-3 text-2xl font-semibold"
          data-en={industry.name}
          data-ko={industryKo?.name ?? industry.name}
        >
          {industry.name}
        </h2>
        <p
          className="mt-3 leading-7 text-[var(--muted)]"
          data-en={industry.description}
          data-ko={industryKo?.description ?? industry.description}
        >
          {industry.description}
        </p>
        <p
          className="mt-5 text-sm font-semibold group-hover:text-[var(--coral-strong)]"
          data-en="Explore the system"
          data-ko="시스템 보기"
        >
          Explore the system
        </p>
      </div>
    </Link>
  );
}

export function EditorialCard({ post }: { post: BlogPost }) {
  const industry = industryPages.find((item) => item.slug === post.industrySlug);
  const imageSrc = industry?.visualTheme.imageSrc ?? "/marketing/brand-launch-kit.png";
  const imageAlt = industry
    ? `${industry.name} branding, website, and print article preview`
    : "Brand launch kit article preview";
  const translatedPost = post.ko;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden border border-[var(--border)] bg-white transition-colors hover:border-[var(--coral)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={1586}
        height={992}
        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="border-t border-[var(--border)] p-5">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
          data-en={`Article · ${post.category}`}
          data-ko={`글 · ${translatedPost?.category ?? post.category}`}
        >
          Article · {post.category}
        </p>
        <h2
          className="mt-4 text-3xl font-semibold leading-tight group-hover:text-[var(--coral-strong)]"
          data-en={post.title}
          data-ko={translatedPost?.title ?? post.title}
        >
          {post.title}
        </h2>
        <p
          className="mt-4 leading-7 text-[var(--muted)]"
          data-en={post.description}
          data-ko={translatedPost?.description ?? post.description}
        >
          {post.description}
        </p>
        <p
          className="mt-6 text-sm font-semibold text-[var(--coral-strong)]"
          data-en="Read article"
          data-ko="글 읽기"
        >
          Read article
        </p>
      </div>
    </Link>
  );
}

export function StudioProcessFlow({
  steps = studioProcessSteps,
  eyebrow = "How projects move",
  title = "From owner ideas to launch-ready assets.",
  description = "The goal is not to force a preset style. We first organize what the owner wants, diagnose what the business needs, compare directions, choose the strongest path, and keep improving the brand after launch.",
  koEyebrow = "프로젝트 진행 방식",
  koTitle = "아이디어를 런칭 가능한 자산으로 정리합니다.",
  koDescription = "정해진 스타일을 억지로 적용하는 것이 아니라, 오너의 생각을 정리하고 비즈니스에 필요한 요소를 진단한 뒤 가장 강한 방향을 선택합니다.",
}: {
  steps?: StudioProcessStep[];
  eyebrow?: string;
  title?: string;
  description?: string;
  koEyebrow?: string;
  koTitle?: string;
  koDescription?: string;
}) {
  return (
    <section className="border-y border-[var(--border)] bg-white">
      <div className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[0.75fr_1fr] md:items-end">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--coral-strong)]"
              data-en={eyebrow}
              data-ko={koEyebrow}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-3 text-3xl font-semibold"
              data-en={title}
              data-ko={koTitle}
            >
              {title}
            </h2>
          </div>
          <p
            className="leading-7 text-[var(--muted)]"
            data-en={description}
            data-ko={koDescription}
          >
            {description}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => {
            const stepKo = getStudioProcessStepKo(step);

            return (
              <article
                key={step.number}
                className={`group relative flex min-h-64 flex-col border p-5 transition duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white ${
                  step.title === "Direction options"
                    ? "border-[var(--coral)] bg-[var(--coral-quiet)] hover:border-[var(--coral-strong)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {step.number}
                  </p>
                  {step.title === "Direction options" ? (
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--coral-strong)]"
                      data-en="Decision point"
                      data-ko="결정 지점"
                    >
                      Decision point
                    </p>
                  ) : null}
                </div>
                <h3
                  className="mt-5 text-xl font-semibold leading-7"
                  data-en={step.title}
                  data-ko={stepKo.title}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]"
                  data-en={step.description}
                  data-ko={stepKo.description}
                >
                  {step.description}
                </p>
                <p
                  className="mt-5 border-t border-[var(--border)] pt-3 text-sm font-semibold text-[var(--coral-strong)]"
                  data-en={`Output: ${step.output}`}
                  data-ko={`결과물: ${stepKo.output}`}
                >
                  Output: {step.output}
                </p>
                <p
                  className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  data-en="Step focus"
                  data-ko="단계 포커스"
                >
                  Step focus
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
