import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { PrototypeBanner } from "@/components/PrototypeBanner";

const bodyFont = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "E2C Pathways",
  description:
    "A visual map from adult education classes to careers, college, and university across North San Diego County.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <LanguageProvider>
          <Header />
          <PrototypeBanner />
          <main className="flex-1">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
