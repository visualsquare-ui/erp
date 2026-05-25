import { describe, expect, it } from "vitest";

import {
  getBlogPost,
  getBlogVisibilityDate,
  getIndustryPage,
  getIndustryPageKo,
  getStudioProcessStepKo,
  getPublishedBlogPosts,
  industryPages,
  studioProcessSteps,
  weeklyBlogPlan,
} from "./marketing-content";
import { marketingNavItems } from "../components/marketing-shell";

describe("marketing content", () => {
  it("publishes scheduled blog posts only after their publish date", () => {
    const posts = getPublishedBlogPosts(new Date("2026-05-27T13:30:00-04:00"));

    expect(posts.map((post) => post.slug)).toContain(
      "branding-checklist-before-opening-med-spa-ny-nj",
    );
    expect(posts.map((post) => post.slug)).not.toContain(
      "what-a-dental-practice-needs-before-launch",
    );
  });

  it("allows the first scheduled post to be previewed in local development", () => {
    const localPreviewDate = getBlogVisibilityDate(
      new Date("2026-05-24T10:00:00-04:00"),
      "development",
    );

    expect(getPublishedBlogPosts(localPreviewDate).map((post) => post.slug)).toEqual([
      "branding-checklist-before-opening-med-spa-ny-nj",
    ]);
  });

  it("keeps scheduled posts hidden before publish date outside local development", () => {
    const productionDate = getBlogVisibilityDate(
      new Date("2026-05-24T10:00:00-04:00"),
      "production",
    );

    expect(getPublishedBlogPosts(productionDate)).toHaveLength(0);
  });

  it("connects blog topics to industry pages", () => {
    const post = getBlogPost("branding-checklist-before-opening-med-spa-ny-nj");
    const industry = getIndustryPage("med-spa-branding-design");

    expect(post?.industrySlug).toBe(industry?.slug);
    expect(industry?.services).toContain("Brand identity");
  });

  it("keeps article titles short enough to scan", () => {
    const post = getBlogPost("branding-checklist-before-opening-med-spa-ny-nj");

    expect(post?.title).toBe("Med Spa Launch Checklist");
    expect(post?.title.length).toBeLessThanOrEqual(32);
  });

  it("keeps a four-week, three-post-per-week launch plan", () => {
    expect(weeklyBlogPlan).toHaveLength(4);
    expect(weeklyBlogPlan.every((week) => week.posts.length === 3)).toBe(true);
  });

  it("keeps public marketing navigation focused on visitors", () => {
    expect(marketingNavItems).toEqual([
      { label: "Services", href: "/#services", ko: "서비스" },
      { label: "Portfolio", href: "/#portfolio", ko: "포트폴리오" },
      { label: "About", href: "/#about", ko: "소개" },
      { label: "Industries", href: "/industries", ko: "업종" },
      { label: "Blog", href: "/blog", ko: "블로그" },
    ]);
    expect(marketingNavItems.map((item) => item.label)).not.toContain(
      "ERP Login",
    );
    expect(marketingNavItems.map((item) => item.href)).not.toContain("/login");
  });

  it("has visual direction for every industry page", () => {
    expect(
      industryPages.every(
        (industry) =>
          industry.visualTheme &&
          industry.visualTheme.imageSrc.startsWith("/marketing/") &&
          industry.visualTheme.palette.length === 3 &&
          industry.visualTheme.previewItems.length >= 3,
      ),
    ).toBe(true);
  });

  it("explains the client collaboration process", () => {
    expect(studioProcessSteps).toHaveLength(8);
    expect(studioProcessSteps.map((step) => step.title)).toContain(
      "Direction options",
    );
    expect(studioProcessSteps.map((step) => step.title)).toContain(
      "Business diagnosis",
    );
    expect(
      studioProcessSteps.some((step) =>
        step.description.includes("A, B, and C"),
      ),
    ).toBe(true);
  });

  it("has Korean copy for shared industry content", () => {
    expect(
      studioProcessSteps.every((step) => {
        const translation = getStudioProcessStepKo(step);

        return (
          translation.title !== step.title &&
          translation.description !== step.description &&
          translation.output !== step.output
        );
      }),
    ).toBe(true);

    expect(
      industryPages.every((industry) => {
        const translation = getIndustryPageKo(industry);

        return (
          translation &&
          translation.name !== industry.name &&
          translation.visualTheme.previewItems.length ===
            industry.visualTheme.previewItems.length &&
          translation.services.length === industry.services.length &&
          translation.deliverables.length === industry.deliverables.length &&
          translation.outcomes.length === industry.outcomes.length &&
          translation.faq.length === industry.faq.length
        );
      }),
    ).toBe(true);
  });

  it("adapts the collaboration process to each industry", () => {
    expect(industryPages.every((industry) => industry.processSteps.length === 8)).toBe(
      true,
    );

    const medSpa = getIndustryPage("med-spa-branding-design");
    const restaurant = getIndustryPage("restaurant-cafe-branding-design");
    const dental = getIndustryPage("dental-clinic-branding-design");

    expect(medSpa?.processSteps.map((step) => step.output)).toContain(
      "Booking-ready launch kit",
    );
    expect(restaurant?.processSteps.map((step) => step.output)).toContain(
      "Menu and opening campaign assets",
    );
    expect(dental?.processSteps.map((step) => step.output)).toContain(
      "Patient-ready communication set",
    );
  });
});
