import type { Metadata } from "next";
import { Inter, Judson, Noto_Sans } from "next/font/google";
import "./globals.css";

const judson = Judson({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-interface",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://inside-monte-carlo.vercel.app"),
  title: {
    default: "Inside Monte-Carlo",
    template: "%s | Inside Monte-Carlo",
  },
  description:
    "Inside Monte-Carlo, le magazine digital consacré aux histoires que Monaco ne raconte pas.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Inside Monte-Carlo",
    title: "Inside Monte-Carlo",
    description: "Les histoires que Monaco ne raconte pas.",
    url: "/",
    images: ["/assets/images/inside-monte-carlo-24.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inside Monte-Carlo",
    description: "Les histoires que Monaco ne raconte pas.",
    images: ["/assets/images/inside-monte-carlo-24.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      data-wf-domain="inside-monte-carlo.vercel.app"
      data-wf-site="66cc288225154d2a15304039"
      className={`${judson.variable} ${notoSans.variable} ${inter.variable}`}
    >
      <head>
        {/* Le fichier CSS Webflow est un asset public tiers, chargé tel quel. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/css/blogwear.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
