import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteJsonLd } from "@/components/SiteJsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://thatjob.6x7.gr"),
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
  title: "ThatJob - AI CV & Cover Letter Generator",
  description: "Generate tailored CVs and cover letters with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Saved Light / Dark / System before first paint: no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((t!=='light')&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d?'dark':'light');}catch(e){}})();",
          }}
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <SiteJsonLd />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
