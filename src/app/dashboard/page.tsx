"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { ProductsService } from "@/service/products/product.service";
import KpiCard from "@/components/admin/kpiCard";
import { Package, AlertTriangle, Layers } from "lucide-react";
import ProductGrid from "@/components/product/productGrid";
import EmptyState from "@/components/common/emptyState";

export default function DashboardPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await ProductsService.listMine({ limit: 50, offset: 0 });
        setItems(res.products ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // KPIs
  const total = items.length;
  const lowStock = useMemo(() => items.filter(p => p.quantity <= 5).length, [items]);
  const totalStock = useMemo(() => items.reduce((acc, p) => acc + (typeof p.quantity === 'number' ? p.quantity : 0), 0), [items]);

  return (
    <section className="flex flex-col min-h-[100dvh] items-center justify-center px-2">
      <div className="w-full max-w-4xl space-y-8 py-10">
        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-xl shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Panel de vendedor</h1>
          <Link className="rounded-md bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-primary-700 dark:hover:bg-primary-400" href="/dashboard/new-product">+ Nuevo producto</Link>
        </div>

        {/* KPIs modernos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard label="Total productos" value={total} hint="Activos en tu catálogo">
            <Package className="text-primary-600 dark:text-primary-400" size={28} />
          </KpiCard>
          <KpiCard label="Stock bajo" value={lowStock} hint="≤ 5 unidades">
            <AlertTriangle className="text-yellow-500" size={28} />
          </KpiCard>
          <KpiCard label="Stock total" value={totalStock} hint="Unidades disponibles">
            <Layers className="text-emerald-600 dark:text-emerald-400" size={28} />
          </KpiCard>
        </div>

        {/* Productos visuales */}
        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-neutral-600 dark:text-neutral-300">Cargando…</span>
            </div>
          ) : items.length === 0 ? (
            <EmptyState text="No tienes productos registrados. ¡Agrega tu primer producto!" />
          ) : (
            <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <ProductGrid items={items} hideAddToCart />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
