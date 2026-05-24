import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const htmlPath = path.join(process.cwd(), "public", "legacy", "index.html");
  const html = await readFile(htmlPath, "utf8");
  const rewrittenHtml = html
    .replace('href="style.css"', 'href="/legacy/style.css"')
    .replace('src="logo-white.png"', 'src="/legacy/logo-white.png"')
    .replace('src="logo.png"', 'src="/legacy/logo.png"')
    .replace('src="script.js?v=4"', 'src="/legacy/script.js?v=4"')
    .replace(
      '<a href="#services" class="nav-link" data-en="Services" data-ko="서비스">Services</a>',
      '<a href="#services" class="nav-link" data-en="Services" data-ko="서비스">Services</a><a href="/industries" class="nav-link" data-en="Industries" data-ko="업종별">Industries</a><a href="/blog" class="nav-link" data-en="Blog" data-ko="블로그">Blog</a>',
    );

  return new NextResponse(rewrittenHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
