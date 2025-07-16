import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/shell";
import { AuthProvider } from "@/lib/contexts/auth";

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
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
