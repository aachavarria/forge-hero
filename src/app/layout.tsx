import type { Metadata } from "next";
import { Marcellus, Spectral, Zilla_Slab, EB_Garamond } from "next/font/google";
import "./globals.css";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Card faces approximate Daggerheart's licensed type: Zilla Slab ≈ Eveleth
// (bold slab titles), EB Garamond ≈ Questa/Yrsa (rules text).
const zillaSlab = Zilla_Slab({
  variable: "--font-card",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forge a Hero — Daggerheart Character Creator",
  description:
    "An illuminated grimoire for forging a Daggerheart character: class, heritage, traits, domain cards and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${spectral.variable} ${zillaSlab.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
