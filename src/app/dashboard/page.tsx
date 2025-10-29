"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { ProductsService } from "@/service/products/product.service";
import KpiCard from "@/components/admin/kpiCard";
import { Package, AlertTriangle, Layers, DollarSign, Building2, ShoppingBag } from "lucide-react";
import ProductGrid from "@/components/product/productGrid";
import EmptyState from "@/components/common/emptyState";

export default function DashboardPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await ProductsService.listOwnerAll({ limit: 50, offset: 0 });
        setItems(res.products ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusChange = (updatedProduct: Product) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedProduct.id ? updatedProduct : item
      )
    );
  };

  // KPIs
  const total = items.length;
  const activeCount = useMemo(() => items.filter(p => p.isActive !== false).length, [items]);
  const inactiveCount = useMemo(() => items.filter(p => p.isActive === false).length, [items]);
  const lowStock = useMemo(() => items.filter(p => p.quantity <= 5 && p.isActive !== false).length, [items]);
  const totalStock = useMemo(() => items.reduce((acc, p) => acc + (typeof p.quantity === 'number' ? p.quantity : 0), 0), [items]);

  return (
    <section className="min-h-screen px-4 py-6">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-xl shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Panel de vendedor</h1>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center gap-1 rounded-md bg-green-600 dark:bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-green-700 dark:hover:bg-green-400" href="/dashboard/orders">
              <ShoppingBag size={16} />
              Pedidos Pendientes
            </Link>
            <Link className="inline-flex items-center gap-1 rounded-md bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-blue-700 dark:hover:bg-blue-400" href="/dashboard/payouts">
              <DollarSign size={16} />
              Mis Pagos
            </Link>
            <Link className="inline-flex items-center gap-1 rounded-md bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-purple-700 dark:hover:bg-purple-400" href="/dashboard/bank-accounts">
              <Building2 size={16} />
              Cuentas Bancarias
            </Link>
            <Link className="rounded-md bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-primary-700 dark:hover:bg-primary-400" href="/dashboard/new-product">+ Nuevo producto</Link>
          </div>
        </div>

        {/* KPIs modernos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard label="Total productos" value={total} hint="En tu catálogo">
            <Package className="text-primary-600 dark:text-primary-400" size={28} />
          </KpiCard>
          <KpiCard label="Productos activos" value={activeCount} hint="Visibles para usuarios">
            <Package className="text-emerald-600 dark:text-emerald-400" size={28} />
          </KpiCard>
          <KpiCard label="Productos inactivos" value={inactiveCount} hint="Ocultos de la vista">
            <Package className="text-red-600 dark:text-red-400" size={28} />
          </KpiCard>
          <KpiCard label="Stock bajo" value={lowStock} hint="≤ 5 unidades">
            <AlertTriangle className="text-yellow-500" size={28} />
          </KpiCard>
        </div>

        {/* Productos */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Mis Productos
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : items.length === 0 ? (
            <EmptyState text="No tienes productos registrados. ¡Agrega tu primer producto!" />
          ) : (
            <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <ProductGrid items={items} hideAddToCart onStatusChange={handleStatusChange} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
