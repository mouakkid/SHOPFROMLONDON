'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

export default function TopBar() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLogged(!!session);
    });
    return () => { sub.subscription.unsubscribe(); };
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
          {logged
            ? <SignOutButton />
            : <Link href="/login" className="btn bg-gray-900 text-white"><ShoppingBag size={16}/> Login</Link>
          }
        </nav>
      </div>
    </header>
  );
}
