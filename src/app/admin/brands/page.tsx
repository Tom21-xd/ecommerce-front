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
    } catch (e: any) {
      toast.error(e.message || "No se pudieron cargar marcas");
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
    } catch (e: any) {
      toast.error(e.message || "Error creando marca");
    } finally { setSaving(false); }
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Marcas"
        subtitle="Catálogo de fabricantes/marcas."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100">
            <RefreshCcw className="h-4 w-4" /> Refrescar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Total marcas" value={rows.length} />
      </div>

      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 rounded-xl border bg-white p-4">
        <input className="border rounded-md px-3 py-2" placeholder="Nombre de la marca" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <button disabled={saving} className="rounded-md bg-black text-white px-4 py-2">
          {saving ? "Guardando…" : "Crear"}
        </button>
      </form>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={2} className="p-4 text-center text-neutral-600">Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-neutral-600">Aún no hay marcas.</td></tr>}
            {!loading && rows.map(m=>(
              <tr key={m.id} className="hover:bg-neutral-50">
                <td className="p-2 border-t">{m.id}</td>
                <td className="p-2 border-t">{m.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
