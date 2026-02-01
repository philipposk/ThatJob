import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThatJob - AI CV & Cover Letter Generator",
  description: "Generate tailored CVs and cover letters with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
