"use client";

import { useEffect, useState } from "react";
import { AddressesService } from "@/service/addresses/addresses.service";
import type { Address } from "@/lib/types";
import { toast } from "sonner";

type FormAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  zip?: string;
  isDefault?: boolean;
};

const empty: FormAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "CO",
  zip: "",
  isDefault: false,
};

export default function AddressesPage() {
  const [rows, setRows] = useState<Address[]>([]);
  const [form, setForm] = useState<FormAddress>({ ...empty });
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await AddressesService.list(); // -> Address[]
      setRows(res ?? []);
    } catch (e: any) {
      toast.error(e.message || "No se pudieron cargar las direcciones");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof FormAddress>(k: K, v: FormAddress[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editing) {
        await AddressesService.update(editing.id, form);
        toast.success("Dirección actualizada");
      } else {
        await AddressesService.create(form);
        toast.success("Dirección creada");
      }
      setForm({ ...empty });
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Error guardando la dirección");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar dirección?")) return;
    try {
      await AddressesService.remove(id);
      toast.success("Eliminada");
      await load();
    } catch (e: any) {
      toast.error(e.message || "No se pudo eliminar");
    }
  }

  function edit(a: Address) {
    setEditing(a);
    setForm({
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state ?? "",
      country: a.country,
      zip: a.zip ?? "",
      isDefault: a.isDefault,
    });
    // Opcional: scroll al formulario
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Direcciones</h1>

      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border bg-white p-4">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2 sm:col-span-2"
          placeholder="Dirección 1"
          value={form.line1}
          onChange={(e) => setField("line1", e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2 sm:col-span-2"
          placeholder="Dirección 2 (opcional)"
          value={form.line2}
          onChange={(e) => setField("line2", e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Ciudad"
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Departamento"
          value={form.state}
          onChange={(e) => setField("state", e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="País"
          value={form.country}
          onChange={(e) => setField("country", e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="ZIP"
          value={form.zip}
          onChange={(e) => setField("zip", e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(form.isDefault)}
            onChange={(e) => setField("isDefault", e.target.checked)}
          />
          Usar como dirección principal
        </label>
        <div className="sm:col-span-2 flex gap-2">
          <button
            disabled={saving}
            className="rounded-md bg-black text-white px-4 py-2"
          >
            {editing ? (saving ? "Actualizando..." : "Actualizar") : (saving ? "Creando..." : "Crear")}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ ...empty });
              }}
              className="rounded-md border px-4 py-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p>Cargando…</p>}

      {!loading && rows.length > 0 && (
        <table className="w-full text-sm border bg-white">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border">Ciudad</th>
              <th className="p-2 border">País</th>
              <th className="p-2 border">Default</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="p-2 border">
                  {a.fullName} — {a.line1}
                </td>
                <td className="p-2 border text-center">{a.city}</td>
                <td className="p-2 border text-center">{a.country}</td>
                <td className="p-2 border text-center">{a.isDefault ? "Sí" : "No"}</td>
                <td className="p-2 border text-right">
                  <div className="inline-flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => edit(a)}>
                      Editar
                    </button>
                    <button className="px-2 py-1 border rounded" onClick={() => remove(a.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-neutral-600">
          No tienes direcciones creadas.
        </div>
      )}
    </section>
  );
}
