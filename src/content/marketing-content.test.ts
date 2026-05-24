import { describe, expect, it } from "vitest";

import {
  getBlogPost,
  getIndustryPage,
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

  it("connects blog topics to industry pages", () => {
    const post = getBlogPost("branding-checklist-before-opening-med-spa-ny-nj");
    const industry = getIndustryPage("med-spa-branding-design");

    expect(post?.industrySlug).toBe(industry?.slug);
    expect(industry?.services).toContain("Brand identity");
  });

  it("keeps a four-week, three-post-per-week launch plan", () => {
    expect(weeklyBlogPlan).toHaveLength(4);
    expect(weeklyBlogPlan.every((week) => week.posts.length === 3)).toBe(true);
  });

  it("keeps public marketing navigation focused on visitors", () => {
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
