"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogService } from "@/service/catalog/catalog.service";
import type { Category } from "@/lib/types";
import { toast } from "sonner";
import SectionHeader from "@/components/admin/sectionHeader";
import KpiCard from "@/components/admin/kpiCard";
import ChartCard from "@/components/admin/chartCard";
import { RefreshCcw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number|undefined>(undefined);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await CatalogService.listCategories();
      setRows(res ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudieron cargar categorías";
      toast.error(msg);
      setRows([]);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ setSlug(slugify(name)); },[name]);

  const kpi = useMemo(() => {
    const topLevel = rows.filter(c => !c.parentId).length;
    const children = rows.length - topLevel;
    return { total: rows.length, topLevel, children };
  }, [rows]);

  const bars = useMemo(() => {
    // cuenta hijos por padre (solo top-level)
    const map = new Map<number, { name: string; count: number }>();
    rows.forEach(c => {
      if (!c.parentId) {
        map.set(c.id, { name: c.name, count: 0 });
      }
    });
    rows.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.count++;
      }
    });
    return Array.from(map.values()).sort((a,b)=>b.count-a.count).slice(0, 12);
  }, [rows]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return toast.error("Nombre y slug requeridos");
    setSaving(true);
    try {
      await CatalogService.createCategory({ name, slug, parentId: parentId || undefined });
      toast.success("Categoría creada");
      setName(""); setSlug(""); setParentId(undefined);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creando categoría";
      toast.error(msg);
    } finally { setSaving(false); }
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Categorías"
        subtitle="Gestión de taxonomía y jerarquías."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100">
            <RefreshCcw className="h-4 w-4" /> Refrescar
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Total"       value={kpi.total} />
        <KpiCard label="Nivel 1"     value={kpi.topLevel} hint="Categorías raíz" />
        <KpiCard label="Subcategorías" value={kpi.children} />
      </div>

      {/* Form */}
      <form onSubmit={save} className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input className="border rounded-md px-3 py-2" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-md px-3 py-2" placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
        <select className="border rounded-md px-3 py-2" value={parentId ?? 0} onChange={e=>setParentId(Number(e.target.value)||undefined)}>
          <option value={0}>(Sin padre)</option>
          {rows.filter(c => !c.parentId).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button disabled={saving} className="rounded-md bg-black text-white px-4 py-2">
          {saving ? "Guardando…" : "Crear"}
        </button>
      </form>

      {/* Chart */}
      <ChartCard title="Top categorías (por cantidad de subcategorías)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Subcategorías" fill="#111827" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Tabla */}
      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Padre</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4 text-center text-neutral-600">Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-neutral-600">Sin resultados</td></tr>}
            {!loading && rows.map(c => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="p-2 border-t">{c.id}</td>
                <td className="p-2 border-t">{c.name}</td>
                <td className="p-2 border-t text-center">{c.slug}</td>
                <td className="p-2 border-t text-center">
                  {rows.find(r => r.id === (c.parentId ?? -1))?.name ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
