"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/types";
import { AuthService } from "@/service/auth/auth.service";
import { onAuthChange } from "@/lib/auth-bus";
import {
  LogIn, LogOut, User2, Home, ShoppingCart, LayoutDashboard, Shield, Menu, X
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
  const [open, setOpen] = useState(false); // menú móvil

  // Carga inicial si hay token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    if (!token) return;
    AuthService.validate().then(setUser).catch(() => setUser(null));
  }, []);

  // Suscripción a cambios de auth (login/logout)
  useEffect(() => {
    const off = onAuthChange(async (e) => {
      if (e.detail.type === "login") {
        try { setUser(await AuthService.validate()); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    });
    return off;
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const isBuyer  = user?.role === "BUYER";

  const midLinks = useMemo<MidLink[]>(
    () => [
      { href: "/",               label: "Inicio",    icon: <Home size={18} />,            show: true,                        match: "exact" },
      { href: "/cart",           label: "Carrito",   icon: <ShoppingCart size={18} />,    show: true,                        match: "startsWith" },
      { href: "/dashboard",      label: "Dashboard", icon: <LayoutDashboard size={18} />, show: Boolean(user && (isSeller || isBuyer)), match: "startsWith" },
      { href: "/admin/products", label: "Admin",     icon: <Shield size={18} />,          show: Boolean(user && isAdmin),    match: "startsWith" },
    ],
    [user, isAdmin, isSeller, isBuyer]
  );

  function isActive(href: string, mode: MidLink["match"] = "startsWith") {
    if (mode === "exact") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function logout() {
    AuthService.logout();
    setOpen(false);
    router.push("/");
  }

  function closeAnd(to?: string) {
    return () => {
      setOpen(false);
      if (to) router.push(to);
    };
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between">
          {/* Marca */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>Marketplace</span>
          </Link>

          {/* Nav centro (solo desktop) */}
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
            <button
              onClick={() => setOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-neutral-100 md:hidden"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Login/Logout (siempre visible) */}
            {!user ? (
              <Link
                href="/login"
                title="Iniciar sesión"
                aria-label="Iniciar sesión"
                className="hidden md:inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-neutral-100"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            ) : (
              <div className="hidden md:inline-flex items-center gap-2">
                <div
                  title={`${user.username} · ${user.role}`}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-900"
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
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {open && (
          <div id="mobile-menu" className="md:hidden border-t pb-3">
            <nav className="flex flex-col px-1 pt-2">
              {midLinks.filter(l => l.show).map((l) => {
                const active = isActive(l.href, l.match);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={closeAnd()}
                    className={`inline-flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition
                      ${active ? "bg-black text-white" : "hover:bg-neutral-100"}`}
                  >
                    {l.icon}
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 px-1">
              {!user ? (
                <Link
                  href="/login"
                  onClick={closeAnd()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              ) : (
                <>
                  <div className="mx-1 mb-2 inline-flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-900">
                    <User2 size={16} />
                    <span className="truncate">{user.username}</span>
                    <span className="opacity-70">· {user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm hover:bg-neutral-100"
                  >
                    <LogOut size={18} />
                    <span>Salir</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
