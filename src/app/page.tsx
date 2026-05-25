/* eslint-disable @next/next/no-css-tags */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Visual Square | Design & Printing Studio",
  description:
    "From websites and brand identity to business cards, signage, catalogs, and custom print production.",
};

function getHomeMarkup() {
  const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? "";

  return body
    .replace(/<script src="script\.js(?:\?v=\d+)?"><\/script>/g, "")
    .replaceAll('href="style.css"', 'href="/home/style.css"')
    .replaceAll('src="logo.png"', 'src="/logo.png"')
    .replaceAll('src="logo-white.png"', 'src="/logo-white.png"');
}

export default function HomePage() {
  return (
    <>
      <link rel="stylesheet" href="/home/style.css?v=7" />
      <div dangerouslySetInnerHTML={{ __html: getHomeMarkup() }} />
      <Script src="/home/script.js?v=9" strategy="afterInteractive" />
    </>
  );
}
