import type { MetadataRoute } from "next";

import {
  getPublishedBlogPosts,
  getSiteUrl,
  industryPages,
} from "@/content/marketing-content";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/industries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ko/industries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/ko/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...industryPages.map((industry) => ({
      url: `${siteUrl}/industries/${industry.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...industryPages.map((industry) => ({
      url: `${siteUrl}/ko/industries/${industry.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getPublishedBlogPosts(now).map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getPublishedBlogPosts(now)
      .filter((post) => post.language === "ko")
      .map((post) => ({
        url: `${siteUrl}/ko/blog/${post.slug}`,
        lastModified: new Date(post.publishDate),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
