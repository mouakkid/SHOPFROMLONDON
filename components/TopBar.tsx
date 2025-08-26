'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ShoppingBag, LayoutDashboard, Table2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function SignOutButton() {
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); }}
      className="btn btn-outline"
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
    <header className="header-glass header-gradient">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo clair en haut */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo-light.svg" alt="Logo" width={140} height={36} priority
                 className="drop-shadow" />
          <span className="sr-only">Home</span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link href="/dashboard" className="nav-link flex items-center gap-2">
            <LayoutDashboard size={16}/> Dashboard
          </Link>
          <Link href="/orders" className="nav-link flex items-center gap-2">
            <Table2 size={16}/> Orders
          </Link>
          {logged ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="btn btn-primary animate-float">
              <ShoppingBag size={16}/> Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
