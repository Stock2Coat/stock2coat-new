import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "Stock2coat - Poedercoating Voorraadbeheersysteem",
  description: "Multi-tenant SaaS inventorysysteem voor poedercoating bedrijven",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
