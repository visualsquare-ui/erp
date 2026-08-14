import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { getSiteUrl } from "@/content/marketing-content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";

  if (host.toLowerCase().startsWith("erp.")) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/blog", "/industries"],
      disallow: [
        "/clients",
        "/vendors",
        "/jobs",
        "/purchasing",
        "/invoices",
        "/projects",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
