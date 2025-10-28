"use client";

import { useEffect, useState } from "react";
import { CatalogService } from "@/service/catalog/catalog.service";
import type { Marca } from "@/lib/types";
import { toast } from "sonner";
import SectionHeader from "@/components/admin/sectionHeader";
import KpiCard from "@/components/admin/kpiCard";
import { RefreshCcw } from "lucide-react";

export default function AdminBrandsPage() {
  const [rows, setRows] = useState<Marca[]>([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRows((await CatalogService.listMarca()) ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudieron cargar marcas";
      toast.error(msg);
      setRows([]);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return toast.error("Nombre requerido");
    setSaving(true);
    try {
      await CatalogService.createMarca({ nombre });
      setNombre("");
      toast.success("Marca creada");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creando marca";
      toast.error(msg);
    } finally { setSaving(false); }
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Marcas"
        subtitle="Catálogo de fabricantes/marcas."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <RefreshCcw className="h-4 w-4" /> Refrescar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Total marcas" value={rows.length} />
      </div>

      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <input className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-md px-3 py-2" placeholder="Nombre de la marca" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <button disabled={saving} className="rounded-md bg-black dark:bg-white text-white dark:text-black px-4 py-2 hover:bg-neutral-800 dark:hover:bg-neutral-200">
          {saving ? "Guardando…" : "Crear"}
        </button>
      </form>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr>
              <th className="p-2 text-left text-neutral-900 dark:text-neutral-100">ID</th>
              <th className="p-2 text-left text-neutral-900 dark:text-neutral-100">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={2} className="p-4 text-center text-neutral-600 dark:text-neutral-400">Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-neutral-600 dark:text-neutral-400">Aún no hay marcas.</td></tr>}
            {!loading && rows.map(m=>(
              <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <td className="p-2 border-t border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">{m.id}</td>
                <td className="p-2 border-t border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">{m.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
