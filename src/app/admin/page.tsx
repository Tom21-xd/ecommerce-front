"use client";

import Link from "next/link";

export default function AdminHome() {
  const cards = [
    { href: "/admin/users", title: "Usuarios", desc: "Gestión por rol, altas/bajas." },
    { href: "/admin/categories", title: "Categorías", desc: "Taxonomía de productos." },
    { href: "/admin/units", title: "Unidades", desc: "Unidades de medida (ej. kg, und)." },
    { href: "/admin/brands", title: "Marcas", desc: "Fabricantes/marcas." },
  ];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Panel de administración</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <li key={c.href} className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-neutral-600">{c.desc}</p>
            <Link href={c.href} className="mt-3 inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-100">
              Abrir
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
