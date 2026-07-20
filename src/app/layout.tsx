import type { Metadata } from "next";
import { Inter, Judson, Noto_Sans } from "next/font/google";
import { MotionLayer } from "@/components/motion-layer";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Inside Monte-Carlo",
    description: "Les histoires que Monaco ne raconte pas.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${judson.variable} ${notoSans.variable} ${inter.variable}`}>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <MotionLayer />
        {children}
      </body>
    </html>
  );
}
