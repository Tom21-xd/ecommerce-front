"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { RefreshCcw, Search, Filter, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { ProductsService } from "@/service/products/product.service";
import KpiCard from "@/components/admin/kpiCard";
import ChartCard from "@/components/admin/chartCard";

type Row = Product & {
  _seller?: string;
  _priceNum: number;
};

const COLORS = ["#111827", "#6B7280", "#9CA3AF", "#D1D5DB", "#A78BFA", "#60A5FA", "#34D399"];

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [minStock, setMinStock] = useState<number>(0);

  async function load() {
    setLoading(true);
    try {
      const res = await ProductsService.list({ limit: 500, offset: 0 });
      const list = (res.products ?? []).map((p) => ({
        ...p,
        _seller: p.container?.user?.username || "—",
        _priceNum: typeof p.price === "string" ? parseFloat(p.price) : Number(p.price ?? 0),
      })) as Row[];
      setRows(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudieron cargar los productos";
      toast.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows
      .filter((p) => p.quantity >= minStock)
      .filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p._seller ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.id - a.id);
  }, [rows, q, minStock]);

  const kpi = useMemo(() => {
    const total = filtered.length;
    const sellers = new Set(filtered.map((p) => p._seller || "—")).size;
    const stock = filtered.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const avgPrice = filtered.length
      ? filtered.reduce((acc, p) => acc + (p._priceNum || 0), 0) / filtered.length
      : 0;
    return { total, sellers, stock, avgPrice };
  }, [filtered]);

  const bySeller = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => map.set(p._seller || "—", (map.get(p._seller || "—") || 0) + 1));
    return Array.from(map.entries())
      .map(([seller, count]) => ({ seller, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [filtered]);

  const priceBuckets = useMemo(() => {
    const buckets = [
      { label: "≤ 50k", min: 0, max: 50000 },
      { label: "50k–200k", min: 50000, max: 200000 },
      { label: "200k–500k", min: 200000, max: 500000 },
      { label: "≥ 500k", min: 500000, max: Infinity },
    ];
    return buckets.map((b) => ({
      name: b.label,
      value: filtered.filter((p) => p._priceNum >= b.min && p._priceNum < b.max).length,
    }));
  }, [filtered]);

  function exportCSV() {
    if (!filtered.length) return toast.message("No hay datos para exportar");
    const head = ["id", "name", "sku", "price", "quantity", "seller"];
    const lines = filtered.map((p) =>
      [p.id, p.name, p.sku, p._priceNum, p.quantity, p._seller].map((v) =>
        typeof v === "string" && v.includes(",") ? `"${v.replace(/"/g, '""')}"` : String(v)
      ).join(",")
    );
    const csv = [head.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "admin_products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Productos (Admin)</h1>
          <p className="text-sm text-neutral-600">Vista con métricas, gráficos y tabla filtrable.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              className="w-56 rounded-md border bg-white pl-8 pr-3 py-2 text-sm"
              placeholder="Buscar nombre/sku/vendedor"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="number"
              min={0}
              className="w-40 rounded-md border bg-white pl-8 pr-3 py-2 text-sm"
              placeholder="Stock mínimo"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value || 0))}
            />
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100"
            title="Refrescar"
          >
            <RefreshCcw className="h-4 w-4" />
            Refrescar
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100"
            title="Exportar CSV"
          >
            <Printer className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Productos" value={kpi.total} />
        <KpiCard label="Vendedores" value={kpi.sellers} />
        <KpiCard label="Stock total" value={kpi.stock} />
        <KpiCard label="Precio promedio" value={Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(kpi.avgPrice || 0)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Productos por vendedor (Top 12)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySeller} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="seller" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Productos" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución por rangos de precio">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={priceBuckets}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {priceBuckets.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-white p-0 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 border-b text-left">ID</th>
              <th className="p-2 border-b text-left">Nombre</th>
              <th className="p-2 border-b">SKU</th>
              <th className="p-2 border-b">Stock</th>
              <th className="p-2 border-b">Precio</th>
              <th className="p-2 border-b text-left">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-neutral-600">Cargando…</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-600">Sin resultados</td>
              </tr>
            )}
            {!loading && filtered.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="p-2 border-t">{p.id}</td>
                <td className="p-2 border-t">{p.name}</td>
                <td className="p-2 border-t text-center">{p.sku}</td>
                <td className="p-2 border-t text-center">{p.quantity}</td>
                <td className="p-2 border-t text-right">
                  {Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(p._priceNum || 0)}
                </td>
                <td className="p-2 border-t">{p._seller}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
