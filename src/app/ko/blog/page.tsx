import type { Metadata } from "next";

import { BlogPageContent } from "@/app/blog/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "디자인 인사이트 블로그 | Visual Square",
  description:
    "뉴욕과 뉴저지 비즈니스 오너를 위한 브랜딩, 웹사이트, 인쇄물, 런치 디자인 인사이트.",
};

export default function KoreanBlogPage() {
  return <BlogPageContent language="ko" />;
}
