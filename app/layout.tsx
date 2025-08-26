import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SHOP FROM LONDON - Orders",
  description: "Simple orders manager with Supabase",
};

function TopBar() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLogged(!!session);
    });
    return () => { sub.subscription.unsubscribe() }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={120} height={30} priority />
          <span className="sr-only">Home</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
          <Link href="/orders" className="text-sm font-medium hover:underline">Orders</Link>
          {logged ? <SignOutButton /> : <Link href="/login" className="btn bg-gray-900 text-white"><ShoppingBag size={16}/> Login</Link>}
        </nav>
      </div>
    </header>
  );
}

function SignOutButton() {
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); }}
      className="btn border bg-white hover:shadow"
      title="Sign out"
    >
      <LogOut size={16} /> Sign out
    </button>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-gray-500">
          Built with Next.js + Supabase
        </footer>
      </body>
    </html>
  );
}
