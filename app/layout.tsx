import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Paint by Numbers",
  description:
    "Upload an image and generate a printable and digital paint-by-numbers result with our modern, easy-to-use tool",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>{children}</body>
      <Analytics />
    </html>
  );
}
