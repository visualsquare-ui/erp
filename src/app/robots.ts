import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/content/marketing-content";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/blog", "/industries"],
      disallow: ["/clients", "/vendors", "/jobs", "/purchasing", "/invoices", "/projects"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
