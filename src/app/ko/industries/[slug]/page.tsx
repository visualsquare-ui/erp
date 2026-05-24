import type { Metadata } from "next";

import {
  generateStaticParams,
  IndustryPageContent,
} from "@/app/industries/[slug]/page";
import { getLocalizedIndustryPage } from "@/content/marketing-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export { generateStaticParams };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getLocalizedIndustryPage(slug, "ko");

  if (!industry) {
    return {};
  }

  return {
    title: `${industry.title} | Visual Square`,
    description: industry.description,
  };
}

export default async function KoreanIndustryPage({ params }: PageProps) {
  const { slug } = await params;
  return <IndustryPageContent slug={slug} language="ko" />;
}
