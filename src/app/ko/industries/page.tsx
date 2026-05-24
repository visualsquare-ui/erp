import type { Metadata } from "next";

import { IndustriesPageContent } from "@/app/industries/page";

export const metadata: Metadata = {
  title: "업종별 디자인 페이지 | Visual Square",
  description:
    "뉴욕과 뉴저지 비즈니스를 위한 브랜딩, 웹사이트, 인쇄물, 제작용 디자인 자산.",
};

export default function KoreanIndustriesPage() {
  return <IndustriesPageContent language="ko" />;
}
