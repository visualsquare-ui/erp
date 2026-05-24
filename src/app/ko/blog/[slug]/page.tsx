import type { Metadata } from "next";

import {
  BlogPostContent,
  generateStaticParams,
} from "@/app/blog/[slug]/page";
import { getBlogPost } from "@/content/marketing-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export { generateStaticParams };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post || new Date(post.publishDate) > new Date()) {
    return {};
  }

  return {
    title: `${post.title} | Visual Square`,
    description: post.description,
    alternates: {
      canonical: `/ko/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishDate,
      locale: "ko_KR",
    },
  };
}

export default async function KoreanBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} language="ko" />;
}
