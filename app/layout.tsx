import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TopBar from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SHOP FROM LONDON - Orders",
  description: "Orders manager with Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 py-6 relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_160px_at_50%_-20px,rgba(167,139,250,0.12),transparent_60%)]" />
          {children}
        </main>
      </body>
    </html>
  );
}
