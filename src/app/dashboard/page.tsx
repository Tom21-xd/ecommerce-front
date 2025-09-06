"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { ProductsService } from "@/service/products/product.service";

export default function DashboardPage() {
  const [items,setItems]=useState<Product[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      try{
        const res = await ProductsService.listMine({ limit: 50, offset: 0 });
        setItems(res.products ?? []);
      } finally { setLoading(false); }
    })();
  },[]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis productos</h1>
        <Link className="rounded-md bg-black text-white px-3 py-2 text-sm" href="/dashboard/new-product">Nuevo</Link>
      </div>

      {loading && <p>Cargando…</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-neutral-600">
          Aún no tienes productos.
        </div>
      )}

      {!loading && items.length > 0 && (
        <table className="w-full text-sm border bg-white">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border">SKU</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Precio</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id}>
                <td className="p-2 border text-center">{p.id}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border text-center">{p.sku}</td>
                <td className="p-2 border text-center">{p.quantity}</td>
                <td className="p-2 border text-right">${Number(p.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
