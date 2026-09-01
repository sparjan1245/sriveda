import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickContact from "@/components/layout/QuickContact";
import { db } from "@/lib/db";
import { getContactInfo } from "@/lib/contact";

// Footer/QuickContact read admin-configured contact & social settings on every
// render; without this, pages with no other dynamic API would be statically
// prerendered at build time and go stale until the next deploy.
export const dynamic = "force-dynamic";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = await (db as any).service
    .findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { name: true, slug: true } })
    .catch(() => []) as { name: string; slug: string }[];
  const contact = await getContactInfo();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <SessionProvider>
          <Header services={services} />
          <main className="flex-1">{children}</main>
          <Footer services={services} />
          <QuickContact
            phone={contact.phones[0]}
            whatsapp={contact.social.whatsapp}
            facebook={contact.social.facebook}
            instagram={contact.social.instagram}
            youtube={contact.social.youtube}
            twitter={contact.social.twitter}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
