import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Instrument_Serif, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import siteMetadata from "@/content-data/site-metadata.json";
import { homePageTitle, siteDescription, siteName } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-source",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-display-source",
  display: "swap",
});

const CANONICAL = siteMetadata.content.canonicalUrl;

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: homePageTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteMetadata.content.keywords,
  authors: [{ name: "Shreyas J", url: CANONICAL }],
  creator: "Shreyas J",
  publisher: "Shreyas J",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.ico", sizes: "any" }],
    shortcut: "/icon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: homePageTitle,
    description: siteDescription,
    url: CANONICAL,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shreyas J — AI Systems & Full-Stack Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homePageTitle,
    description: siteDescription,
    creator: "@KidzeeSmart",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shreyas J — AI Systems & Full-Stack Builder",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${instrumentSerif.variable} bg-bg font-body text-text-primary antialiased`}
      >
        {children}

        {/* Umami Analytics — lightweight, privacy-friendly, async/defer */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="37cc3495-241d-48bc-8754-8fc2fa94fccb"
          strategy="afterInteractive"
        />

        {/* Vercel Analytics — page views & traffic insights */}
        <Analytics />

        {/* Vercel Speed Insights — Core Web Vitals monitoring */}
        <SpeedInsights />
      </body>
    </html>
  );
}
