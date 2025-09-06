"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductsService } from "@/service/products/product.service";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      try{
        const res = await ProductsService.listAdmin({ limit: 50, offset: 0 });
        setRows(res.products ?? []);
      } finally { setLoading(false); }
    })();
  },[]);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Productos (SELLER)</h1>
      {loading && <p>Cargando…</p>}
      {!loading && (
        <table className="w-full text-sm border bg-white">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p:any)=>(
              <tr key={p.id}>
                <td className="p-2 border text-center">{p.id}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border text-right">${Number(p.price).toLocaleString()}</td>
                <td className="p-2 border">{p?.container?.user?.username} ({p?.container?.user?.email})</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
