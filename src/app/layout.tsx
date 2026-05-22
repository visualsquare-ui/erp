import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Square ERP",
  description: "Project-centered ERP shell for Visual Square",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
