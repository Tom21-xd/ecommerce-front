"use client";

import { useEffect, useMemo, useState } from "react";
import { UsersService } from "@/service/users/users.service";
import type { User } from "@/lib/types";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import SectionHeader from "@/components/admin/sectionHeader";
import KpiCard from "@/components/admin/kpiCard";
import ChartCard from "@/components/admin/chartCard";

const COLORS = ["#111827", "#6B7280", "#A78BFA"];

export default function AdminUsersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [admins, sellers, buyers] = await Promise.all([
        UsersService.byRole("ADMIN"),
        UsersService.byRole("SELLER"),
        UsersService.byRole("BUYER"),
      ]);
      setRows([...(admins ?? []), ...(sellers ?? []), ...(buyers ?? [])]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo cargar usuarios";
      toast.error(msg);
      setRows([]);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  const counts = useMemo(() => {
    const c = { ADMIN: 0, SELLER: 0, BUYER: 0 } as Record<"ADMIN"|"SELLER"|"BUYER", number>;
    rows.forEach(u => c[u.role]++);
    return c;
  }, [rows]);

  const donutData = useMemo(() => ([
    { name: "ADMIN", value: counts.ADMIN },
    { name: "SELLER", value: counts.SELLER },
    { name: "BUYER",  value: counts.BUYER },
  ]), [counts]);

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Usuarios"
        subtitle="Distribución por rol y listado general."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100">
            <RefreshCcw className="h-4 w-4" /> Refrescar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Total"     value={rows.length} />
        <KpiCard label="Admins"    value={counts.ADMIN} />
        <KpiCard label="Sellers"   value={counts.SELLER} />
        <KpiCard label="Buyers"    value={counts.BUYER} />
      </div>

      <ChartCard title="Usuarios por rol">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Usuario</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2">Rol</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4 text-center text-neutral-600">Cargando…</td></tr>}
            {!loading && rows.length===0 && <tr><td colSpan={4} className="p-6 text-center text-neutral-600">Sin resultados</td></tr>}
            {!loading && rows.map(u=>(
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="p-2 border-t">{u.id}</td>
                <td className="p-2 border-t">{u.username}</td>
                <td className="p-2 border-t">{u.email}</td>
                <td className="p-2 border-t text-center">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
