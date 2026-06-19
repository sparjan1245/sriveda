import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickContact from "@/components/layout/QuickContact";

export const metadata: Metadata = {
  title: {
    default: "Sri Veda Gayatri Temple | Manteca, CA",
    template: "%s | Sri Veda Gayatri Temple",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  description:
    "Sri Veda Gayatri Temple in Manteca, CA — a spiritual and charitable non-profit dedicated to fostering spiritual growth, cultural education, and religious activities for the Hindu community.",
  keywords: [
    "Hindu temple Manteca",
    "Veda Gayatri Temple",
    "puja services California",
    "homam",
    "archana",
    "abhishekam",
    "astrology",
    "Hindu religious services",
  ],
  openGraph: {
    title: "Sri Veda Gayatri Temple",
    description: "A spiritual sanctuary for the Hindu community in Manteca, CA",
    url: "https://srivedagayatritemple.org",
    siteName: "Sri Veda Gayatri Temple",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <QuickContact />
        </SessionProvider>
      </body>
    </html>
  );
}
