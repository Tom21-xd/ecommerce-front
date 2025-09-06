"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/types";
import { AuthService } from "@/service/auth/auth.service";
import {
  LogIn,
  LogOut,
  User2,
  Home,
  ShoppingCart,
  LayoutDashboard,
  Shield
} from "lucide-react";

type MidLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  show: boolean;
  match?: "exact" | "startsWith";
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    if (!token) return;
    AuthService.validate()
      .then((u) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const isBuyer  = user?.role === "BUYER";

  const midLinks = useMemo<MidLink[]>(
    () => [
      { href: "/",                label: "Inicio",    icon: <Home size={18} />,            show: true,                        match: "exact" },
      { href: "/cart",            label: "Carrito",   icon: <ShoppingCart size={18} />,    show: true,                        match: "startsWith" },
      { href: "/dashboard",       label: "Dashboard", icon: <LayoutDashboard size={18} />, show: Boolean(user && (isSeller || isBuyer)), match: "startsWith" },
      { href: "/admin/products",  label: "Admin",     icon: <Shield size={18} />,          show: Boolean(user && isAdmin),    match: "startsWith" },
    ],
    [user, isAdmin, isSeller, isBuyer]
  );

  function isActive(href: string, mode: MidLink["match"] = "startsWith") {
    if (mode === "exact") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function logout() {
    AuthService.logout();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>Marketplace</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {midLinks.filter(l => l.show).map((l) => {
              const active = isActive(l.href, l.match);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                    ${active ? "bg-black text-white" : "hover:bg-neutral-100"}`}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <Link
                href="/login"
                title="Iniciar sesión"
                aria-label="Iniciar sesión"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-neutral-100"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            ) : (
              <>
                <div
                  title={`${user.username} · ${user.role}`}
                  className="hidden md:inline-flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-900"
                >
                  <User2 size={16} />
                  <span className="truncate max-w-[12rem]">{user.username}</span>
                  <span className="opacity-70">· {user.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-neutral-100"
                >
                  <LogOut size={18} />
                  <span>Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
