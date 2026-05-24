import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/content/marketing-content";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/industries"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
