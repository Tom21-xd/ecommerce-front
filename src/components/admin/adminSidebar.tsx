"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Layers, Box, Tag, PackageSearch, ChevronLeft, ChevronRight, MessageCircle, DollarSign, Building2 } from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const isAdmin = true;
  const links = [
    { href: "/admin/products",   label: "Products",   icon: <PackageSearch size={18} /> },
    { href: "/admin/users",      label: "Usuarios",   icon: <Users size={18} /> },
    { href: "/admin/payouts",    label: "Dispersiones", icon: <DollarSign size={18} /> },
    { href: "/admin/bank-accounts", label: "Cuentas Bancarias", icon: <Building2 size={18} /> },
    { href: "/admin/categories", label: "Categorías", icon: <Layers size={18} /> },
    { href: "/admin/units",      label: "Unidades",   icon: <Box size={18} /> },
    { href: "/admin/brands",     label: "Marcas",     icon: <Tag size={18} /> },
    ...(isAdmin ? [{ href: "/admin/wpp", label: "WhatsApp", icon: <MessageCircle size={18} /> }] : []),
  ];

  return (
    <aside className={`sticky top-[72px] self-start rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm ${open ? "w-60" : "w-14"} transition-all`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="mb-2 w-full rounded-md border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        title={open ? "Colapsar" : "Expandir"}
      >
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      <nav className="flex flex-col gap-1">
        {links.map(l => {
          const active = pathname === l.href || (pathname && pathname.startsWith(l.href + "/"));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                ${active ? "bg-black dark:bg-white text-white dark:text-black" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"}`}
            >
              {l.icon}
              {open && <span>{l.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
